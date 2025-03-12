import OpenAI from 'openai';
import { getDecryptedApiKey } from './agent-db';
import { ReadableStream } from 'stream/web';

interface ChatCompletionOptions {
  apiConnectionId: string;
  userId: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  model: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Generates a chat completion using the OpenAI API
 */
export async function generateChatCompletion(options: ChatCompletionOptions) {
  try {
    console.log(`Generating OpenAI chat completion with model ${options.model}`);
    
    // Get the API key
    const apiKey = await getDecryptedApiKey(options.apiConnectionId, options.userId);
    if (!apiKey) {
      console.error('API key not found or could not be decrypted');
      throw new Error('API key not found or could not be decrypted');
    }

    console.log('API key retrieved successfully');

    // Create an OpenAI client
    const openai = new OpenAI({
      apiKey,
    });

    console.log(`Sending request to OpenAI API with ${options.messages.length} messages`);
    
    // Generate a chat completion
    const completion = await openai.chat.completions.create({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      stream: true,
    });

    console.log('OpenAI API request successful');
    return completion;
  } catch (error: any) {
    console.error('Error generating OpenAI chat completion:', error);
    
    // Enhance error message with more details
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      console.error(`OpenAI API error (${statusCode}):`, errorData);
      
      // Rethrow with more specific error message
      if (statusCode === 401) {
        throw new Error('Authentication error: Invalid API key');
      } else if (statusCode === 429) {
        throw new Error('Rate limit exceeded: Too many requests or quota exceeded');
      } else if (statusCode === 404) {
        throw new Error(`Model not found: ${options.model} is not available`);
      }
    }
    
    // Rethrow the original error if we couldn't enhance it
    throw error;
  }
}

// Define types for OpenAIStream
type AzureChatCompletions = {
  promptFilterResults: any[];
  [key: string]: any;
};

type AsyncIterableOpenAIStreamReturnTypes = AsyncIterable<AzureChatCompletions>;

interface OpenAIStreamCallbacks {
  onCompletion?: (completion: string) => void | Promise<void>;
  onToken?: (token: string) => void | Promise<void>;
}

/**
 * Creates a ReadableStream from an OpenAI streaming response
 */
export function OpenAIStream(
  response: AsyncIterableOpenAIStreamReturnTypes | Response,
  callbacks?: OpenAIStreamCallbacks
): ReadableStream {
  const encoder = new TextEncoder();
  let fullCompletion = '';
  
  return new ReadableStream({
    async start(controller) {
      try {
        console.log('Starting OpenAI stream processing');
        
        if (response instanceof Response) {
          // Handle Response type
          console.log('Processing Response type stream');
          const reader = response.body?.getReader();
          if (!reader) {
            console.error('Response body is null or undefined');
            throw new Error('Response body is null or undefined');
          }
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } else {
          // Handle AsyncIterable type
          console.log('Processing AsyncIterable type stream');
          for await (const chunk of response) {
            const content = chunk.choices?.[0]?.delta?.content || '';
            if (content) {
              fullCompletion += content;
              if (callbacks?.onToken) {
                try {
                  await callbacks.onToken(content);
                } catch (error) {
                  console.error('Error in onToken callback:', error);
                }
              }
              controller.enqueue(encoder.encode(content));
            }
          }
        }
        
        console.log('Stream processing completed');
        if (callbacks?.onCompletion) {
          try {
            await callbacks.onCompletion(fullCompletion);
            console.log('onCompletion callback executed successfully');
          } catch (error) {
            console.error('Error in onCompletion callback:', error);
          }
        }
        
        controller.close();
      } catch (error) {
        console.error('Error processing OpenAI stream:', error);
        controller.error(error);
      }
    },
  });
} 