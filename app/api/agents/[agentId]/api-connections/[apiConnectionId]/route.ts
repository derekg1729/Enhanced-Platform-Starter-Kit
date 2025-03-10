import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  connectAgentToApi, 
  disconnectAgentFromApi, 
  getAgentById, 
  getApiConnectionById 
} from '../../../../../../lib/agent-db';

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
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the agent exists
  const agent = await getAgentById(params.agentId, session.user.id);
  
  // Handle the case where the agent doesn't exist with the user filter
  if (!agent) {
    // Check if the agent exists without user filter
    const agentExists = await getAgentById(params.agentId, '');
    if (!agentExists) {
      // Agent doesn't exist at all
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
  }
  
  // At this point, we either have an agent that belongs to the user,
  // or we know an agent exists but doesn't belong to the user
  
  // Check if the API connection exists and belongs to the user
  // This is needed for the test that checks if the agent doesn't belong to the user
  const apiConnection = await getApiConnectionById(params.apiConnectionId, session.user.id);
  
  // If the agent exists but doesn't belong to the user, return 403
  if (agent && agent.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // If we got here and don't have an agent, it means the agent exists but doesn't belong to the user
  if (!agent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Check if the API connection exists
  if (!apiConnection) {
    return NextResponse.json({ error: 'API connection not found' }, { status: 404 });
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
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the agent exists
  const agent = await getAgentById(params.agentId, session.user.id);
  
  // First check if the agent exists at all
  if (!agent) {
    // Check if the agent exists without user filter
    const agentExists = await getAgentById(params.agentId, '');
    if (agentExists) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    } else {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
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