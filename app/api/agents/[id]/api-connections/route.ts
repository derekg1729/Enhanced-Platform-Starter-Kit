import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getApiConnectionsForAgent, getAgentById } from '../../../../../lib/agent-db';

/**
 * GET /api/agents/:id/api-connections
 * 
 * Returns all API connections for a specific agent.
 * Requires authentication and ownership of the agent.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the agent exists and belongs to the user
  const agent = await getAgentById(params.id, session.user.id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Get all API connections for the agent
  const apiConnections = await getApiConnectionsForAgent(params.id, session.user.id);

  // Return the API connections (without the API keys)
  const apiConnectionsWithoutKeys = apiConnections.map(({ apiKey, ...connection }) => connection);
  return NextResponse.json(apiConnectionsWithoutKeys);
} 