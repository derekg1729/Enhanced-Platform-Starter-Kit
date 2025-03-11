import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentById, createAgentMessage, getApiConnectionsForAgent } from '@/lib/agent-db';
import { getUserById } from '@/lib/user-db';
import { z } from 'zod';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { generateChatCompletion } from '@/lib/openai';
import { v4 as uuidv4 } from 'uuid';

// Define a custom session type with the expected user properties
interface CustomSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

// Define the request body schema
const chatRequestSchema = z.object({
  message: z.string().min(1, { message: 'Message is required' }),
  conversationId: z.string().optional(),
});

/**
 * POST /api/agents/[agentId]/chat
 * 
 * Sends a message to an agent and returns the response.
 * Requires authentication.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized - You must be logged in to chat with an agent' 
      }, { status: 401 });
    }

    // Verify user exists in database
    const user = await getUserById(session.user.id);
    if (!user) {
      console.error(`User not found in database: ${session.user.id}`);
      return NextResponse.json(
        { 
          error: 'User account not found in database. This is likely a system error. Please try logging out and back in, or contact support if the issue persists.' 
        },
        { status: 500 }
      );
    }

    // Parse and validate the request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body - failed to parse JSON' },
        { status: 400 }
      );
    }

    // Validate the request body against the schema
    const result = chatRequestSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return NextResponse.json(
        { error: `Validation failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Get the agent
    const agent = await getAgentById(params.agentId, session.user.id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get the agent's API connections
    const apiConnections = await getApiConnectionsForAgent(params.agentId, session.user.id);
    
    // Check if the agent has an OpenAI API connection
    const openaiConnection = apiConnections.find(conn => conn.service === 'openai');
    if (!openaiConnection) {
      return NextResponse.json(
        { error: 'This agent does not have an OpenAI API connection configured' },
        { status: 400 }
      );
    }

    // Generate a conversation ID if not provided
    const conversationId = result.data.conversationId || uuidv4();

    // Store the user message in the database
    await createAgentMessage({
      agentId: params.agentId,
      userId: session.user.id,
      role: 'user',
      content: result.data.message,
      conversationId,
    });

    try {
      // Generate a response from OpenAI
      const stream = await generateChatCompletion({
        apiConnectionId: openaiConnection.id,
        userId: session.user.id,
        messages: [
          { role: 'system', content: agent.systemPrompt },
          { role: 'user', content: result.data.message }
        ],
        model: agent.model || 'gpt-3.5-turbo',
        temperature: Number(agent.temperature) || 0.7,
        max_tokens: agent.maxTokens || 1000,
      });

      // Create a streaming response
      const openAIStream = OpenAIStream(stream as any, {
        onCompletion: async (completion) => {
          // Store the assistant message in the database
          await createAgentMessage({
            agentId: params.agentId,
            userId: session.user.id,
            role: 'assistant',
            content: completion,
            conversationId,
          });
        },
      });

      // Return the streaming response
      return new StreamingTextResponse(openAIStream);
    } catch (error) {
      console.error('Error generating chat completion:', error);
      return NextResponse.json(
        { error: 'Failed to generate a response from OpenAI. Please try again or check your API connection.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in chat processing:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again or contact support.' },
      { status: 500 }
    );
  }
} 