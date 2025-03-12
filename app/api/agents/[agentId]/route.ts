import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getAgentById, 
  updateAgent, 
  deleteAgent 
} from '@/lib/agent-db';

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
 * GET /api/agents/:agentId
 * 
 * Returns a specific agent.
 * Requires authentication and ownership of the agent.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the agent
  const agent = await getAgentById(params.agentId, session.user.id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Return the agent
  return NextResponse.json(agent);
}

/**
 * PUT /api/agents/:agentId
 * 
 * Updates a specific agent.
 * Requires authentication and ownership of the agent.
 * Supports partial updates - only the fields that are provided will be updated.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse the request body
  const body = await req.json();

  // For model updates, we need at least the model and apiConnectionId
  if (body.model !== undefined && !body.apiConnectionId) {
    return NextResponse.json({ error: 'API connection ID is required when updating the model' }, { status: 400 });
  }

  // Update the agent with the provided fields
  const updatedAgent = await updateAgent(
    params.agentId,
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

  if (!updatedAgent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Return the updated agent
  return NextResponse.json(updatedAgent);
}

/**
 * DELETE /api/agents/:agentId
 * 
 * Deletes a specific agent.
 * Requires authentication and ownership of the agent.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete the agent
  const success = await deleteAgent(params.agentId, session.user.id);
  if (!success) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
} 