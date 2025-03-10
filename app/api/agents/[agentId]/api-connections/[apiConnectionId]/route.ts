import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { 
  connectAgentToApi, 
  disconnectAgentFromApi, 
  getAgentById, 
  getApiConnectionById 
} from '../../../../../../lib/agent-db';

/**
 * POST /api/agents/:agentId/api-connections/:apiConnectionId
 * 
 * Connects an agent to an API connection.
 * Requires authentication and ownership of both the agent and the API connection.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { agentId: string; apiConnectionId: string } }
) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the agent exists and belongs to the user
  const agent = await getAgentById(params.agentId, session.user.id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Check if the API connection exists and belongs to the user
  const apiConnection = await getApiConnectionById(params.apiConnectionId, session.user.id);
  if (!apiConnection) {
    return NextResponse.json({ error: 'API connection not found' }, { status: 404 });
  }

  // Check if the agent belongs to the user
  if (agent.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check if the API connection belongs to the user
  if (apiConnection.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Connect the agent to the API connection
  const connection = await connectAgentToApi(
    params.agentId,
    params.apiConnectionId,
    session.user.id
  );

  // Return the connection
  return NextResponse.json(connection, { status: 201 });
}

/**
 * DELETE /api/agents/:agentId/api-connections/:apiConnectionId
 * 
 * Disconnects an agent from an API connection.
 * Requires authentication and ownership of the agent.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { agentId: string; apiConnectionId: string } }
) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the agent exists and belongs to the user
  const agent = await getAgentById(params.agentId, session.user.id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Check if the agent belongs to the user
  if (agent.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Disconnect the agent from the API connection
  const success = await disconnectAgentFromApi(
    params.agentId,
    params.apiConnectionId,
    session.user.id
  );

  if (!success) {
    return NextResponse.json(
      { error: 'Connection not found or deletion failed' },
      { status: 404 }
    );
  }

  // Return success
  return NextResponse.json({ success: true });
} 