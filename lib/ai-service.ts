import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { decrypt } from './encryption';

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

// Currently supported Anthropic models - using the correct ID format
const SUPPORTED_ANTHROPIC_MODELS = {
  'claude-3-opus': 'claude-3-opus-20240229',
  'claude-3-sonnet': 'claude-3-opus-20240229', // Temporarily using opus as a fallback for sonnet
  'claude-3-haiku': 'claude-3-haiku-20240307',
  'claude-2': 'claude-2.1',
  'claude-instant-1': 'claude-instant-1.2',
};

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
    // Map user-friendly model names to the actual model IDs that work with Anthropic's API
    let mappedModelId = '';
    
    // If it's a known model, use the known working ID
    if (modelId.startsWith('claude-3-sonnet')) {
      mappedModelId = SUPPORTED_ANTHROPIC_MODELS['claude-3-opus']; // Use opus as fallback for sonnet
    } else if (modelId.startsWith('claude-3-opus')) {
      mappedModelId = SUPPORTED_ANTHROPIC_MODELS['claude-3-opus'];
    } else if (modelId.startsWith('claude-3-haiku')) {
      mappedModelId = SUPPORTED_ANTHROPIC_MODELS['claude-3-haiku'];
    } else if (modelId.startsWith('claude-2')) {
      mappedModelId = SUPPORTED_ANTHROPIC_MODELS['claude-2'];
    } else {
      // If it's not a known model, use claude-3-opus as a fallback
      mappedModelId = SUPPORTED_ANTHROPIC_MODELS['claude-3-opus'];
    }
    
    this.modelId = mappedModelId;
    
    console.log(`Using Anthropic model: ${this.modelId} (requested: ${modelId})`);
    
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

      // Make the API call with proper error handling
      const response = await this.anthropic.messages.create({
        model: this.modelId,
        messages: formattedMessages,
        system: systemPrompt || undefined,
        max_tokens: maxTokens,
        temperature: options.temperature,
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

export function createAIService(modelId: string, encryptedApiKey: string): AIService {
  // Get the encryption key from environment
  const encryptionKey = process.env.ENCRYPTION_KEY || 
    'd2e372921d15fe9312e6d45740ded074a019027122525ec390889154ba85d72f';
  
  // Decrypt the API key
  const apiKey = decrypt(encryptedApiKey, encryptionKey);

  // Create the appropriate service based on the model
  if (modelId.startsWith('gpt')) {
    return new OpenAIService(modelId, apiKey);
  } else if (modelId.startsWith('claude')) {
    return new AnthropicService(modelId, apiKey);
  } else {
    throw new Error(`Unsupported model: ${modelId}`);
  }
} 