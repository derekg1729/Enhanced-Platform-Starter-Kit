import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllAvailableModels, getAvailableModels } from '@/lib/actions/model-actions';

/**
 * GET /api/ai/models - Get all available models for all providers
 * GET /api/ai/models?provider=openai - Get all available models for a specific provider
 * 
 * This route is designed to work in both build-time static generation and runtime contexts.
 * During build time, it returns a minimal static response.
 * During runtime, it uses server-side features to provide the full functionality.
 */
export async function GET(req: NextRequest) {
  // Check if we're in a static build context by seeing if headers() is available
  // This approach avoids needing force-dynamic
  let isStaticBuild = false;
  try {
    // This will throw during static build
    req.headers;
  } catch (e) {
    isStaticBuild = true;
  }

  // If we're in a static build context, return a minimal static response
  if (isStaticBuild) {
    return NextResponse.json({ 
      models: {}, 
      note: "This is a static build response. Full model list available at runtime." 
    });
  }

  // Normal runtime behavior
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