import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllAvailableModels, getAvailableModels } from '@/lib/actions/model-actions';

/**
 * GET /api/ai/models - Get all available models for all providers
 * GET /api/ai/models?provider=openai - Get all available models for a specific provider
 */
export async function GET(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    // Access user id safely
    const userId = session?.user ? (session.user as any).id : undefined;
    
    // Get provider from query params
    const searchParams = req.nextUrl.searchParams;
    const provider = searchParams.get('provider');
    
    if (provider) {
      // Get models for specific provider
      const models = await getAvailableModels(provider, userId);
      return NextResponse.json({ models });
    } else {
      // Get models for all providers
      const modelsMap = await getAllAvailableModels(userId);
      return NextResponse.json({ models: modelsMap });
    }
  } catch (error) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available AI models' },
      { status: 500 }
    );
  }
} 