import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getApiConnectionById, 
  updateApiConnection, 
  deleteApiConnection 
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
 * GET /api/api-connections/:id
 * 
 * Returns a specific API connection.
 * Requires authentication and ownership of the API connection.
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

  // Get the API connection
  const apiConnection = await getApiConnectionById(params.id, session.user.id);
  if (!apiConnection) {
    return NextResponse.json({ error: 'API connection not found' }, { status: 404 });
  }

  // Return the API connection (without the API key)
  const { apiKey, ...apiConnectionWithoutKey } = apiConnection;
  return NextResponse.json(apiConnectionWithoutKey);
}

/**
 * PUT /api/api-connections/:id
 * 
 * Updates a specific API connection.
 * Requires authentication and ownership of the API connection.
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

  // Update the API connection
  const updatedConnection = await updateApiConnection(
    params.id,
    session.user.id,
    {
      name: body.name,
      service: body.service,
      apiKey: body.apiKey,
      metadata: body.metadata,
    }
  );

  if (!updatedConnection) {
    return NextResponse.json({ error: 'API connection not found' }, { status: 404 });
  }

  // Return the updated API connection (without the API key)
  const { apiKey, ...updatedConnectionWithoutKey } = updatedConnection;
  return NextResponse.json(updatedConnectionWithoutKey);
}

/**
 * DELETE /api/api-connections/:id
 * 
 * Deletes a specific API connection.
 * Requires authentication and ownership of the API connection.
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

  // Delete the API connection
  const success = await deleteApiConnection(params.id, session.user.id);
  if (!success) {
    return NextResponse.json({ error: 'API connection not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
} 