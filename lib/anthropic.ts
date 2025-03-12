import { Anthropic } from '@anthropic-ai/sdk';
import { getDecryptedApiKey } from './agent-db';
import { ReadableStream } from 'stream/web';

// Define valid Anthropic model names with their version suffixes
export const VALID_ANTHROPIC_MODELS = [
  'claude-3-7-sonnet-20250219',
  'claude-3-7-sonnet-thinking-20250219',
  'claude-3-5-sonnet-20240620',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307'
];

// Map from short model names to full model names with version suffixes
export const MODEL_NAME_MAP: Record<string, string> = {
  'claude-3.7-sonnet': 'claude-3-7-sonnet-20250219',
  'claude-3.7-sonnet-thinking': 'claude-3-7-sonnet-thinking-20250219',
  'claude-3.5-sonnet': 'claude-3-5-sonnet-20240620',
  'claude-3-7-sonnet': 'claude-3-7-sonnet-20250219',
  'claude-3-7-sonnet-thinking': 'claude-3-7-sonnet-thinking-20250219',
  'claude-3-5-sonnet': 'claude-3-5-sonnet-20240620',
  'claude-3-opus': 'claude-3-opus-20240229',
  'claude-3-sonnet': 'claude-3-sonnet-20240229',
  'claude-3-haiku': 'claude-3-haiku-20240307'
};

export interface ChatCompletionOptions {
  apiConnectionId: string;
  userId: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  model: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Generates a chat completion using the Anthropic API
 */
export async function generateChatCompletion(options: ChatCompletionOptions) {
  try {
    console.log(`Generating Anthropic chat completion with model ${options.model}`);
    const { apiConnectionId, userId, messages, model, temperature = 0.7, max_tokens = 1024 } = options;

    // Validate and normalize the model name
    let normalizedModel = model;
    
    // If the model name doesn't include a version suffix, try to map it to a valid model
    if (!VALID_ANTHROPIC_MODELS.includes(normalizedModel)) {
      // Check if we have a mapping for this model name
      if (MODEL_NAME_MAP[normalizedModel]) {
        console.log(`Mapping model name ${normalizedModel} to ${MODEL_NAME_MAP[normalizedModel]}`);
        normalizedModel = MODEL_NAME_MAP[normalizedModel];
      } else {
        // Try to find a matching model by prefix
        const matchingModel = VALID_ANTHROPIC_MODELS.find(validModel => 
          validModel.startsWith(normalizedModel)
        );
        
        if (matchingModel) {
          console.log(`Found matching model ${matchingModel} for ${normalizedModel}`);
          normalizedModel = matchingModel;
        } else {
          console.error(`Invalid Anthropic model: ${normalizedModel}`);
          throw new Error(`Invalid Anthropic model: ${normalizedModel}. Please use a valid model name with version suffix.`);
        }
      }
    }

    // Get the API key
    const apiKey = await getDecryptedApiKey(apiConnectionId, userId);
    if (!apiKey) {
      console.error('API key not found or could not be decrypted');
      throw new Error('API key not found');
    }

    console.log('API key retrieved successfully');

    // Create the Anthropic client
    const anthropic = new Anthropic({
      apiKey,
    });

    // Convert messages to Anthropic format (Anthropic doesn't support system messages directly)
    const anthropicMessages = messages.map(message => {
      if (message.role === 'system') {
        // Convert system messages to user messages with a special prefix
        return { role: 'user' as const, content: `<system>${message.content}</system>` };
      }
      return { role: message.role === 'user' ? 'user' as const : 'assistant' as const, content: message.content };
    });

    // Filter out any consecutive assistant messages (Anthropic requires alternating user/assistant)
    const filteredMessages = anthropicMessages.filter((message, index, array) => {
      if (index === 0) return true;
      return message.role !== array[index - 1].role;
    });

    // Ensure the last message is from the user
    const finalMessages = filteredMessages.length > 0 && filteredMessages[filteredMessages.length - 1].role === 'assistant'
      ? [...filteredMessages, { role: 'user' as const, content: 'Please continue.' }]
      : filteredMessages;

    console.log(`Sending request to Anthropic API with ${finalMessages.length} messages`);

    // Generate the completion
    try {
      const completion = await anthropic.messages.create({
        model: normalizedModel,
        messages: finalMessages,
        temperature,
        max_tokens: max_tokens,
        stream: true,
      });

      console.log('Anthropic API request successful');
      return completion;
    } catch (apiError: any) {
      console.error('Anthropic API error:', apiError);
      
      // Enhance error message with more details
      if (apiError.status) {
        const statusCode = apiError.status;
        
        // Rethrow with more specific error message
        if (statusCode === 401) {
          throw new Error('Authentication error: Invalid API key');
        } else if (statusCode === 429) {
          throw new Error('Rate limit exceeded: Too many requests or quota exceeded');
        } else if (statusCode === 404) {
          throw new Error(`Model not found: ${normalizedModel} is not available`);
        }
      }
      
      throw apiError;
    }
  } catch (error: any) {
    console.error('Error generating Anthropic chat completion:', error);
    throw error;
  }
}

// Define types for AnthropicStream
export interface AnthropicStreamCallbacks {
  onCompletion?: (completion: string) => void;
  onToken?: (token: string) => void;
}

/**
 * Creates a ReadableStream from an Anthropic streaming response
 * Handles both AsyncIterable and ReadableStream responses from the Anthropic API
 */
export function AnthropicStream(
  stream: ReadableStream<any> | AsyncIterable<any>,
  callbacks?: AnthropicStreamCallbacks
): ReadableStream<Uint8Array> {
  let responseText = '';

  return new ReadableStream({
    async start(controller) {
      console.log('Starting Anthropic stream processing');
      
      try {
        // Check if the stream is an AsyncIterable (has Symbol.asyncIterator)
        if (stream && typeof (stream as any)[Symbol.asyncIterator] === 'function') {
          console.log('Processing AsyncIterable type stream');
          
          // Process as AsyncIterable
          const asyncIterable = stream as AsyncIterable<any>;
          for await (const chunk of asyncIterable) {
            if (chunk.type === 'content_block_delta') {
              const token = chunk.delta?.text || '';
              responseText += token;
              
              if (callbacks?.onToken) {
                try {
                  callbacks.onToken(token);
                } catch (error) {
                  console.error('Error in onToken callback:', error);
                }
              }
              
              // Encode the token as UTF-8
              const encoder = new TextEncoder();
              const encodedChunk = encoder.encode(token);
              controller.enqueue(encodedChunk);
            }
          }
          
          console.log('AsyncIterable stream processing completed');
        } 
        // Check if it's a ReadableStream (has getReader method)
        else if (stream && typeof (stream as ReadableStream<any>).getReader === 'function') {
          console.log('Processing ReadableStream type stream');
          
          // Process as ReadableStream
          const reader = (stream as ReadableStream<any>).getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('ReadableStream completed');
              break;
            }

            // Process the chunk
            if (value.type === 'content_block_delta') {
              const token = value.delta?.text || '';
              responseText += token;
              
              if (callbacks?.onToken) {
                try {
                  callbacks.onToken(token);
                } catch (error) {
                  console.error('Error in onToken callback:', error);
                }
              }
              
              // Encode the token as UTF-8
              const encoder = new TextEncoder();
              const chunk = encoder.encode(token);
              controller.enqueue(chunk);
            }
          }
        } 
        else {
          throw new Error('Unsupported stream type: Stream must be either AsyncIterable or ReadableStream');
        }
        
        // Call completion callback
        if (callbacks?.onCompletion) {
          try {
            callbacks.onCompletion(responseText);
            console.log('onCompletion callback executed successfully');
          } catch (error) {
            console.error('Error in onCompletion callback:', error);
          }
        }
        
        controller.close();
      } catch (error) {
        console.error('Error processing Anthropic stream:', error);
        controller.error(error);
      }
    },
  });
} 