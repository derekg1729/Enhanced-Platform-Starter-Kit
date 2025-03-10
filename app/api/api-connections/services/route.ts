import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Define the supported services
const supportedServices = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Connect to OpenAI API for GPT models',
    logoUrl: '/images/services/openai.svg',
    apiKeyName: 'API Key',
    apiKeyPattern: '^sk-[a-zA-Z0-9]{48}$',
    apiKeyLink: 'https://platform.openai.com/account/api-keys',
    apiKeyInstructions: 'Create an API key in the OpenAI dashboard',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Connect to Anthropic API for Claude models',
    logoUrl: '/images/services/anthropic.svg',
    apiKeyName: 'API Key',
    apiKeyPattern: '^sk-ant-[a-zA-Z0-9]{48}$',
    apiKeyLink: 'https://console.anthropic.com/account/keys',
    apiKeyInstructions: 'Create an API key in the Anthropic console',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect to GitHub API for repository access',
    logoUrl: '/images/services/github.svg',
    apiKeyName: 'Personal Access Token',
    apiKeyPattern: '^ghp_[a-zA-Z0-9]{36}$',
    apiKeyLink: 'https://github.com/settings/tokens',
    apiKeyInstructions: 'Create a personal access token with repo scope',
  },
];

/**
 * GET /api/api-connections/services
 * 
 * Returns a list of supported services for API connections.
 * Requires authentication.
 */
export async function GET(req: NextRequest) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return the list of supported services
  return NextResponse.json(supportedServices);
} 