import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getAgentById, 
  updateAgent, 
  deleteAgent 
} from '../../../../lib/agent-db';

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
 * GET /api/agents/:id
 * 
 * Returns a specific agent.
 * Requires authentication and ownership of the agent.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the agent
  const agent = await getAgentById(params.id, session.user.id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Return the agent
  return NextResponse.json(agent);
}

/**
 * PUT /api/agents/:id
 * 
 * Updates a specific agent.
 * Requires authentication and ownership of the agent.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse the request body
  const body = await req.json();

  // Update the agent
  const updatedAgent = await updateAgent(
    params.id,
    session.user.id,
    {
      name: body.name,
      description: body.description,
      systemPrompt: body.systemPrompt,
      model: body.model,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
    }
  );

  if (!updatedAgent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Return the updated agent
  return NextResponse.json(updatedAgent);
}

/**
 * DELETE /api/agents/:id
 * 
 * Deletes a specific agent.
 * Requires authentication and ownership of the agent.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete the agent
  const success = await deleteAgent(params.id, session.user.id);
  if (!success) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
} 