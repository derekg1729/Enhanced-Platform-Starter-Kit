import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { decrypt } from './encryption';
import { getFullModelId } from './actions/model-actions';

// Types
export interface Message {
  role: string;
  content: string;
}

export interface AIResponse {
  content: string;
}

export interface AIServiceOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface AIService {
  generateChatResponse(
    messages: Message[],
    options?: AIServiceOptions
  ): Promise<AIResponse>;
}

export class OpenAIService implements AIService {
  private openai: OpenAI;
  private modelId: string;

  constructor(modelId: string, apiKey: string) {
    this.modelId = modelId;
    this.openai = new OpenAI({ 
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateChatResponse(
    messages: Message[],
    options: AIServiceOptions = {}
  ): Promise<AIResponse> {
    try {
      // Convert messages to OpenAI format
      const formattedMessages = messages.map(msg => {
        if (msg.role === 'system') {
          return { role: 'system' as const, content: msg.content };
        } else if (msg.role === 'user') {
          return { role: 'user' as const, content: msg.content };
        } else if (msg.role === 'assistant') {
          return { role: 'assistant' as const, content: msg.content };
        }
        // Default to user if role is not recognized
        return { role: 'user' as const, content: msg.content };
      });

      const response = await this.openai.chat.completions.create({
        model: this.modelId,
        messages: formattedMessages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
      });

      return {
        content: response.choices[0].message.content || '',
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`AI service error: ${(error as Error).message}`);
    }
  }
}

export class AnthropicService implements AIService {
  private anthropic: Anthropic;
  private modelId: string;

  constructor(modelId: string, apiKey: string) {
    // Store the full model ID
    this.modelId = modelId;
    
    console.log(`Using Anthropic model: ${this.modelId}`);
    
    this.anthropic = new Anthropic({ 
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateChatResponse(
    messages: Message[],
    options: AIServiceOptions = {}
  ): Promise<AIResponse> {
    try {
      // Convert to Anthropic format
      const systemMessages = messages.filter(msg => msg.role === 'system');
      const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
      
      // Get system prompt (combining all system messages if multiple)
      const systemPrompt = systemMessages.map(msg => msg.content).join('\n');
      
      // Format non-system messages for Anthropic
      const formattedMessages = nonSystemMessages.map(msg => {
        if (msg.role === 'user') {
          return { role: 'user' as const, content: msg.content };
        } else if (msg.role === 'assistant') {
          return { role: 'assistant' as const, content: msg.content };
        }
        // Default to user for unrecognized roles
        return { role: 'user' as const, content: msg.content };
      });

      // Set default max tokens if not provided
      const maxTokens = options.maxTokens || 1000;
      
      // Set default temperature if not provided and ensure it's within valid range (0-1)
      // Anthropic API requires temperature to be between 0 and 1
      let temperature = options.temperature !== undefined ? options.temperature : 0.7;
      
      // Clamp temperature to valid range for Anthropic API
      temperature = Math.min(Math.max(temperature, 0), 1);

      // Make the API call with proper error handling
      const response = await this.anthropic.messages.create({
        model: this.modelId,
        messages: formattedMessages,
        system: systemPrompt || undefined,
        max_tokens: maxTokens,
        temperature: temperature,
      });

      // Handle the response content blocks correctly
      let content = '';
      if (response.content && response.content.length > 0) {
        const contentBlock = response.content[0];
        if (contentBlock.type === 'text' && 'text' in contentBlock) {
          content = contentBlock.text;
        }
      }

      return { content };
    } catch (error) {
      console.error('Anthropic API error:', error);
      // Make sure we're capturing and throwing the error in a format that can be displayed
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`AI service error: ${errorMessage}`);
    }
  }
}

export async function createAIService(modelId: string, encryptedApiKey: string): Promise<AIService> {
  // Get the encryption key from environment
  const encryptionKey = process.env.ENCRYPTION_KEY || 
    'd2e372921d15fe9312e6d45740ded074a019027122525ec390889154ba85d72f';
  
  // Decrypt the API key
  const apiKey = decrypt(encryptedApiKey, encryptionKey);

  // Determine provider and get full model ID
  let provider: string;
  let fullModelId: string;
  
  if (modelId.startsWith('gpt')) {
    provider = 'openai';
  } else if (modelId.startsWith('claude')) {
    provider = 'anthropic';
  } else {
    throw new Error(`Unsupported model: ${modelId}`);
  }
  
  // Get the full model ID for any provider using the unified getFullModelId function
  fullModelId = await getFullModelId(modelId, provider);

  // Create the appropriate service based on the model
  if (provider === 'openai') {
    return new OpenAIService(fullModelId, apiKey);
  } else if (provider === 'anthropic') {
    return new AnthropicService(fullModelId, apiKey);
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Sends a message to the AI service using the specified agent configuration
 * 
 * @param agent - The agent configuration with model, temperature, and instructions
 * @param messages - An array of message objects with role and content
 * @param apiKey - The encrypted API key for the service
 * @returns A promise that resolves to the AI response
 */
export async function sendMessageToAI(
  agent: { model: string; temperature?: number; instructions?: string },
  messages: Message[],
  apiKey: string
): Promise<AIResponse> {
  try {
    // Create the AI service based on the agent model
    const aiService = await createAIService(agent.model, apiKey);
    
    // Prepare messages with system instructions if available
    let processedMessages = [...messages];
    
    // Add instructions as a system message if provided
    if (agent.instructions) {
      processedMessages.unshift({
        role: 'system',
        content: agent.instructions
      });
    }
    
    // Get response with the specified temperature
    const options: AIServiceOptions = {};
    if (agent.temperature !== undefined) {
      // If this is an Anthropic model, ensure temperature is in range 0-1
      if (agent.model.includes('claude')) {
        options.temperature = Math.min(Math.max(agent.temperature, 0), 1);
      } else {
        options.temperature = agent.temperature;
      }
    }
    
    return await aiService.generateChatResponse(processedMessages, options);
  } catch (error) {
    console.error('Error in sendMessageToAI:', error);
    throw error;
  }
} 