import { Anthropic } from '@anthropic-ai/sdk';
import { getDecryptedApiKey } from './agent-db';
import { ReadableStream } from 'stream/web';

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
        model,
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
          throw new Error(`Model not found: ${model} is not available`);
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
 */
export function AnthropicStream(
  stream: ReadableStream<any>,
  callbacks?: AnthropicStreamCallbacks
): ReadableStream<Uint8Array> {
  let responseText = '';

  return new ReadableStream({
    async start(controller) {
      console.log('Starting Anthropic stream processing');
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('Anthropic stream completed');
            if (callbacks?.onCompletion) {
              try {
                callbacks.onCompletion(responseText);
                console.log('onCompletion callback executed successfully');
              } catch (error) {
                console.error('Error in onCompletion callback:', error);
              }
            }
            controller.close();
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
      } catch (error) {
        console.error('Error processing Anthropic stream:', error);
        controller.error(error);
      }
    },
  });
} 