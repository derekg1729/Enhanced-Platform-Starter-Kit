import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAgent, getAgentsByUserId } from '../../../lib/agent-db';

// Define a custom session type
interface CustomSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
  expires: string;
}

/**
 * POST /api/agents
 * 
 * Creates a new agent.
 * Requires authentication.
 */
export async function POST(req: NextRequest) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse the request body
  const body = await req.json();

  // Validate required fields
  if (!body.name || !body.systemPrompt || !body.apiConnectionId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Create the agent
  const agent = await createAgent(
    session.user.id,
    {
      name: body.name,
      description: body.description,
      systemPrompt: body.systemPrompt,
      model: body.model,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      apiConnectionId: body.apiConnectionId,
    }
  );

  // Return the created agent
  return NextResponse.json(agent, { status: 201 });
}

/**
 * GET /api/agents
 * 
 * Returns all agents for the authenticated user.
 * Requires authentication.
 */
export async function GET(req: NextRequest) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all agents for the user
  const agents = await getAgentsByUserId(session.user.id);

  // Return the agents
  return NextResponse.json(agents);
} 