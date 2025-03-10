import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { createApiConnection, getApiConnectionsByUserId } from '../../../lib/agent-db';

/**
 * POST /api/api-connections
 * 
 * Creates a new API connection.
 * Requires authentication.
 */
export async function POST(req: NextRequest) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse the request body
  const body = await req.json();

  // Validate required fields
  if (!body.name || !body.service || !body.apiKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Create the API connection
  const apiConnection = await createApiConnection({
    name: body.name,
    service: body.service,
    apiKey: body.apiKey,
    userId: session.user.id,
    metadata: body.metadata || {},
  });

  // Return the created API connection (without the API key)
  const { apiKey, ...apiConnectionWithoutKey } = apiConnection;
  return NextResponse.json(apiConnectionWithoutKey, { status: 201 });
}

/**
 * GET /api/api-connections
 * 
 * Returns all API connections for the authenticated user.
 * Requires authentication.
 */
export async function GET(req: NextRequest) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all API connections for the user
  const apiConnections = await getApiConnectionsByUserId(session.user.id);

  // Return the API connections (without the API keys)
  const apiConnectionsWithoutKeys = apiConnections.map(({ apiKey, ...connection }) => connection);
  return NextResponse.json(apiConnectionsWithoutKeys);
} 