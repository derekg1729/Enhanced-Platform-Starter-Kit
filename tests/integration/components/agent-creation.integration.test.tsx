import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import AgentsPageClient from '../../../app/app/(dashboard)/agents/AgentsPageClient';
import { Agent } from '../../../components/agent/AgentCard';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Define the interface for agent creation request
interface AgentCreateRequest {
  name: string;
  description?: string;
  systemPrompt: string;
  model?: string;
  temperature?: string;
  maxTokens?: number;
}

// Mock data for testing
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'API Agent 1',
    description: 'This agent comes from the API',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: 'https://example.com/image1.png',
    status: 'active',
    type: 'chat',
  },
  {
    id: 'agent-2',
    name: 'API Agent 2',
    description: 'This is another agent from the API',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: 'https://example.com/image2.png',
    status: 'active',
    type: 'chat',
  },
];

// Setup MSW server
const server = setupServer(
  // GET handler for /api/agents
  http.get('/api/agents', () => {
    return HttpResponse.json(mockAgents);
  }),

  // POST handler for /api/agents
  http.post('/api/agents', async ({ request }) => {
    const data = await request.json() as AgentCreateRequest;
    const newAgent: Agent = {
      id: 'new-agent-id',
      name: data.name,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: 'https://example.com/new-agent.png',
      status: 'active',
      type: 'chat',
    };
    
    return HttpResponse.json(newAgent, { status: 201 });
  })
);

// Start MSW server before tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Agent Creation', () => {
  it('displays mock agents when rendered', async () => {
    render(<AgentsPageClient initialAgents={mockAgents} initialLoading={false} testMode={true} />);
    
    // Check if mock agents are displayed
    expect(screen.getByText('API Agent 1')).toBeInTheDocument();
    expect(screen.getByText('API Agent 2')).toBeInTheDocument();
  });
}); 