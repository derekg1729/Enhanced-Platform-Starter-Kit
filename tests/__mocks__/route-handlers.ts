import { NextRequest, NextResponse } from 'next/server';

// Mock agent route handler
export const getAgent = async (
  req: NextRequest,
  { params }: { params: { agentId: string } }
) => {
  return NextResponse.json({
    id: params.agentId,
    name: 'Test Agent',
    userId: 'test-user-id'
  });
};

// Mock agent API connections route handler
export const getAgentApiConnections = async (
  req: NextRequest,
  { params }: { params: { agentId: string } }
) => {
  return NextResponse.json([]);
}; 