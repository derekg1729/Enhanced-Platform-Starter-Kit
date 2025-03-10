import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import AgentsPage from '../../../app/app/(dashboard)/agents/page';

// Mock the metadata export
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Define the expected request type
interface AgentCreateRequest {
  name: string;
  description?: string;
  systemPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Set up MSW server
const handlers = [
  // Mock the GET /api/agents endpoint
  http.get('/api/agents', () => {
    return HttpResponse.json([]);
  }),
  
  // Mock the POST /api/agents endpoint
  http.post('/api/agents', async ({ request }) => {
    const data = await request.json() as AgentCreateRequest;
    return HttpResponse.json({
      id: 'new-agent-id',
      name: data.name,
      description: data.description,
      systemPrompt: data.systemPrompt,
      model: data.model,
      temperature: data.temperature?.toString(),
      maxTokens: data.maxTokens,
      userId: 'test-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),
];

const server = setupServer(...handlers);

// Start MSW server
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('Agent Creation', () => {
  it('should display mock agents when rendered', async () => {
    // Render the component
    render(<AgentsPage />);
    
    // Verify that the mock agents are displayed
    expect(screen.getByText('Hello World Agent')).toBeInTheDocument();
    expect(screen.getByText('Email Assistant')).toBeInTheDocument();
    expect(screen.getByText('A simple conversational agent that can respond to basic queries.')).toBeInTheDocument();
  });
}); 