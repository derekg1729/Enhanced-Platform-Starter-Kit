import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

// Define the supported API services
const API_SERVICES = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI API for GPT models',
    url: 'https://platform.openai.com/api-keys',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    keyFormat: /^sk-[A-Za-z0-9]{32,}$/,
    keyName: 'API Key',
    keyInstructions: 'Create an API key in the OpenAI dashboard',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Anthropic API for Claude models',
    url: 'https://console.anthropic.com/keys',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    keyFormat: /^sk-ant-[A-Za-z0-9]{32,}$/,
    keyName: 'API Key',
    keyInstructions: 'Create an API key in the Anthropic console',
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Google AI API for Gemini models',
    url: 'https://ai.google.dev/',
    models: ['gemini-pro', 'gemini-ultra'],
    keyFormat: /^[A-Za-z0-9_-]{39}$/,
    keyName: 'API Key',
    keyInstructions: 'Create an API key in the Google AI Studio',
  },
  {
    id: 'custom',
    name: 'Custom API',
    description: 'Custom API for other models',
    url: '',
    models: [],
    keyFormat: /.+/,
    keyName: 'API Key',
    keyInstructions: 'Enter your custom API key',
  },
];

/**
 * GET /api/api-connections/services
 * 
 * Returns a list of supported API services.
 * Requires authentication.
 */
export async function GET(req: NextRequest) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions) as CustomSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return the list of supported API services
  return NextResponse.json(API_SERVICES);
} 