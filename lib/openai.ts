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
  // Get the API key
  const apiKey = await getDecryptedApiKey(options.apiConnectionId, options.userId);
  if (!apiKey) {
    throw new Error('API key not found or could not be decrypted');
  }

  // Create an OpenAI client
  const openai = new OpenAI({
    apiKey,
  });

  // Generate a chat completion
  return openai.chat.completions.create({
    model: options.model,
    messages: options.messages,
    temperature: options.temperature,
    max_tokens: options.max_tokens,
    stream: true,
  });
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
        if (response instanceof Response) {
          // Handle Response type
          const reader = response.body?.getReader();
          if (!reader) throw new Error('Response body is null or undefined');
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } else {
          // Handle AsyncIterable type
          for await (const chunk of response) {
            const content = chunk.choices?.[0]?.delta?.content || '';
            if (content) {
              fullCompletion += content;
              if (callbacks?.onToken) await callbacks.onToken(content);
              controller.enqueue(encoder.encode(content));
            }
          }
        }
        
        if (callbacks?.onCompletion) await callbacks.onCompletion(fullCompletion);
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
} 