import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentById, createAgentMessage, getApiConnectionsForAgent } from '@/lib/agent-db';
import { getUserById, getUserByEmail } from '@/lib/user-db';
import { z } from 'zod';
import { StreamingTextResponse } from 'ai';
import { generateChatCompletion as generateOpenAIChatCompletion, OpenAIStream } from '@/lib/openai';
import { generateChatCompletion as generateAnthropicChatCompletion, AnthropicStream } from '@/lib/anthropic';
import { ModelProvider, getModelProvider } from '@/lib/model-utils';
import { v4 as uuidv4 } from 'uuid';
import { 
  createConversation, 
  getConversationById, 
  getConversationMessages, 
  createUserMessage,
  createAssistantMessage
} from '@/lib/conversation-db';

// Define the request body schema
const chatRequestSchema = z.object({
  message: z.string().min(1, { message: 'Message is required' }),
  conversationId: z.string().optional(),
});

// Define a custom session type with the expected user properties
interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * POST /api/agents/[agentId]/chat
 * 
 * Sends a message to an agent and returns the response.
 * Requires authentication.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { agentId: string } }
): Promise<Response> {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error('Unauthorized access attempt to chat API');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user ID from the session
    // If the session only has an email, look up the user by email
    let userId = '';
    
    const sessionUser = session.user as SessionUser;
    
    if (sessionUser.id) {
      // Use the ID directly if available
      userId = sessionUser.id;
    } else if (sessionUser.email) {
      // Look up the user by email
      console.log(`Looking up user by email: ${sessionUser.email}`);
      const user = await getUserByEmail(sessionUser.email);
      if (user) {
        userId = user.id;
        console.log(`Found user ID: ${userId} for email: ${sessionUser.email}`);
      } else {
        userId = sessionUser.email;
        console.log(`No user found for email: ${sessionUser.email}, using email as ID`);
      }
    }

    if (!userId) {
      console.error('User ID not found in session', session);
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`Processing chat request for agent ${params.agentId} from user ${userId}`);

    // Get the agent
    const agent = await getAgentById(params.agentId, userId);
    if (!agent) {
      console.error(`Agent not found: ${params.agentId} for user ${userId}`);
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    console.log(`Found agent: ${agent.name} with model ${agent.model}`);

    // Get the agent's API connections
    const apiConnections = await getApiConnectionsForAgent(params.agentId, userId);
    if (!apiConnections || apiConnections.length === 0) {
      console.error(`No API connections found for agent ${params.agentId}`);
      return NextResponse.json(
        { error: 'No API connections found for this agent' },
        { status: 400 }
      );
    }

    console.log(`Found ${apiConnections.length} API connections for agent ${params.agentId}`);
    console.log(`API connections: ${apiConnections.map(conn => `${conn.name} (${conn.service})`).join(', ')}`);

    // Get the conversation or create a new one
    let conversation;
    if (conversationId) {
      conversation = await getConversationById(conversationId);
      if (!conversation) {
        console.error(`Conversation not found: ${conversationId}`);
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      console.log(`Using existing conversation: ${conversationId}`);
    } else {
      conversation = await createConversation({
        agentId: params.agentId,
        userId,
        title: message.substring(0, 100),
      });
      console.log(`Created new conversation: ${conversation.id}`);
    }

    // Create a user message
    await createUserMessage({
      conversationId: conversation.id,
      content: message,
    });
    console.log(`Created user message in conversation ${conversation.id}`);

    // Get the conversation messages
    const messages = await getConversationMessages(conversation.id);
    console.log(`Retrieved ${messages.length} messages from conversation ${conversation.id}`);
    
    // Format messages for the API
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    // Add the system message if it exists
    if (agent.systemPrompt) {
      formattedMessages.unshift({
        role: 'system' as const,
        content: agent.systemPrompt,
      });
      console.log('Added system prompt to messages');
    }

    // Determine the model provider
    const modelProvider = getModelProvider(agent.model);
    console.log(`Determined model provider: ${modelProvider} for model ${agent.model}`);
    
    // Find the appropriate API connection for the model provider
    // First try exact match
    let apiConnection = apiConnections.find(
      (conn) => conn.service === modelProvider
    );

    // If no exact match is found, try case-insensitive matching
    if (!apiConnection) {
      console.log(`No exact match found for ${modelProvider}, trying case-insensitive matching`);
      apiConnection = apiConnections.find(
        (conn) => conn.service.toLowerCase() === modelProvider.toLowerCase()
      );
    }
    
    // If still no match, try to find a connection that contains the model provider name
    if (!apiConnection) {
      console.log(`No case-insensitive match found, trying partial matching`);
      apiConnection = apiConnections.find(
        (conn) => conn.service.toLowerCase().includes(modelProvider.toLowerCase()) || 
                 modelProvider.toLowerCase().includes(conn.service.toLowerCase())
      );
    }
    
    // If still no match, use the first available connection as a fallback
    if (!apiConnection && apiConnections.length > 0) {
      console.log(`No matching service found, using first available connection as fallback`);
      apiConnection = apiConnections[0];
    }

    if (!apiConnection) {
      console.error(`No API connection found for model provider ${modelProvider}`);
      return NextResponse.json(
        { error: `No API connection found for model provider ${modelProvider}. Please add an API connection for ${modelProvider}.` },
        { status: 400 }
      );
    }

    console.log(`Using API connection: ${apiConnection.name} (${apiConnection.service}) for model provider ${modelProvider}`);

    try {
      // Generate a response based on the model provider
      if (modelProvider === ModelProvider.OPENAI) {
        console.log('Generating OpenAI response...');
        const response = await generateOpenAIChatCompletion({
          apiConnectionId: apiConnection.id,
          userId,
          messages: formattedMessages,
          model: agent.model,
          temperature: agent.temperature ? parseFloat(agent.temperature.toString()) : 0.7,
          max_tokens: agent.maxTokens || 1024,
        });
        
        if (!response) {
          throw new Error('Failed to generate OpenAI response');
        }
        
        console.log('Successfully generated OpenAI response, creating streaming response');
        
        // Create a streaming response with proper type assertion
        return new StreamingTextResponse(
          // @ts-ignore - Type mismatch between stream/web and web standard ReadableStream
          OpenAIStream(response, {
            onCompletion: async (completion) => {
              // Store the assistant's message in the database
              try {
                await createAssistantMessage({
                  conversationId: conversation.id,
                  content: completion,
                });
                console.log(`Stored assistant message in conversation ${conversation.id}`);
              } catch (error) {
                console.error('Error storing assistant message:', error);
              }
            }
          }), 
          {
            headers: {
              'X-Conversation-Id': conversation.id,
            },
          }
        );
      } 
      else if (modelProvider === ModelProvider.ANTHROPIC) {
        console.log('Generating Anthropic response...');
        const response = await generateAnthropicChatCompletion({
          apiConnectionId: apiConnection.id,
          userId,
          messages: formattedMessages,
          model: agent.model,
          temperature: agent.temperature ? parseFloat(agent.temperature.toString()) : 0.7,
          max_tokens: agent.maxTokens || 1024,
        });
        
        if (!response) {
          throw new Error('Failed to generate Anthropic response');
        }
        
        console.log('Successfully generated Anthropic response, creating streaming response');
        
        // Create a streaming response with proper type assertion
        return new StreamingTextResponse(
          // @ts-ignore - Type mismatch between stream/web and web standard ReadableStream
          AnthropicStream(response, {
            onCompletion: async (completion) => {
              // Store the assistant's message in the database
              try {
                await createAssistantMessage({
                  conversationId: conversation.id,
                  content: completion,
                });
                console.log(`Stored assistant message in conversation ${conversation.id}`);
              } catch (error) {
                console.error('Error storing assistant message:', error);
              }
            }
          }), 
          {
            headers: {
              'X-Conversation-Id': conversation.id,
            },
          }
        );
      }
      else {
        console.error(`Unsupported model provider: ${modelProvider}`);
        return NextResponse.json(
          { error: `Unsupported model provider: ${modelProvider}` },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error(`Error generating ${modelProvider} response:`, error);
      
      // Check for specific error types
      if (error.message?.includes('API key') || error.message?.includes('authentication')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your API connection settings.' },
          { status: 401 }
        );
      } else if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else if (error.message?.includes('model') && error.message?.includes('not found') || error.message?.includes('not available')) {
        // Provide a more helpful error message for model not found errors
        let errorMessage = 'The selected model is not available.';
        
        // For Anthropic models, suggest using the full model name with version
        if (modelProvider === ModelProvider.ANTHROPIC) {
          errorMessage += ' For Claude models, please use one of the following model names: claude-3-7-sonnet-20250219, claude-3-5-sonnet-20240620, claude-3-opus-20240229, claude-3-sonnet-20240229, or claude-3-haiku-20240307.';
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
      
      // Generic error
      return NextResponse.json(
        { error: 'Failed to generate a response. Please try again or check your API connection.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to generate a response. Please try again or check your API connection.' },
      { status: 500 }
    );
  }
} 