import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createApiConnection, getApiConnectionsByUserId } from '../../../lib/agent-db';
import { z } from 'zod';

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

// Define the request body schema
const createApiConnectionSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  service: z.string().min(1, { message: 'Service is required' }),
  apiKey: z.string().min(1, { message: 'API Key is required' }),
  metadata: z.record(z.any()).optional(),
});

/**
 * POST /api/api-connections
 * 
 * Creates a new API connection.
 * Requires authentication.
 */
export async function POST(req: NextRequest) {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const result = createApiConnectionSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return NextResponse.json(
        { error: `Validation failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Create the API connection
    try {
      const apiConnection = await createApiConnection(
        session.user.id,
        {
          name: result.data.name,
          service: result.data.service,
          apiKey: result.data.apiKey,
          metadata: result.data.metadata || {},
        }
      );

      // Return the created API connection (without the API key)
      const { apiKey, ...apiConnectionWithoutKey } = apiConnection;
      return NextResponse.json(apiConnectionWithoutKey, { status: 201 });
    } catch (error) {
      console.error('Error creating API connection:', error);
      return NextResponse.json(
        { error: 'Failed to create API connection' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in API connection creation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/api-connections
 * 
 * Returns all API connections for the authenticated user.
 * Requires authentication.
 */
export async function GET(req: NextRequest) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all API connections for the user
  const apiConnections = await getApiConnectionsByUserId(session.user.id);

  // Return the API connections (without the API keys)
  const apiConnectionsWithoutKeys = apiConnections.map(({ apiKey, ...connection }) => connection);
  return NextResponse.json(apiConnectionsWithoutKeys);
} 