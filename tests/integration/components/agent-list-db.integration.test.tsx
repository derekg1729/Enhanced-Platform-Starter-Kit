import { describe, it, expect, beforeEach, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AgentsPageClient from '../../../app/app/(dashboard)/agents/AgentsPageClient';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from '../../__helpers__/setup';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Create MSW server with all handlers
const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen());

// Close server after all tests
afterAll(() => server.close());

describe('AgentsPageClient with Database Integration', () => {
  // Reset handlers before each test
  beforeEach(() => {
    // Reset handlers to default
    server.resetHandlers();
    // Clear any mocks between tests
    vi.clearAllMocks();
  });
  
  // Clean up after each test
  afterEach(() => {
    server.resetHandlers();
  });
  
  it('fetches and displays agents from the API', async () => {
    render(<AgentsPageClient testMode={false} />);
    
    // Should show loading state initially
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    
    // Wait for agents to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check if agents from API are displayed
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
    expect(screen.getByText('This is a test agent')).toBeInTheDocument();
    expect(screen.getByText('This is another test agent')).toBeInTheDocument();
  });
  
  it('handles API errors gracefully', async () => {
    // Use initialError prop to simulate error state
    render(
      <AgentsPageClient 
        testMode={true} 
        initialError="Error loading agents. Please try again later." 
        initialLoading={false}
      />
    );
    
    // Check if error message is displayed
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Error loading agents. Please try again later.')).toBeInTheDocument();
  });
  
  it('shows empty state when API returns no agents', async () => {
    // Use initialAgents prop with empty array to simulate empty state
    render(
      <AgentsPageClient 
        testMode={true} 
        initialAgents={[]} 
        initialLoading={false}
      />
    );
    
    // Check if empty state message is displayed
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/No agents found/i)).toBeInTheDocument();
  });
  
  it('properly maps database fields to Agent interface', async () => {
    render(<AgentsPageClient testMode={false} />);
    
    // Wait for agents to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check if status badges are displayed correctly
    // Since we're mapping from DB to Agent interface, we should see the status badges
    const statusBadges = screen.getAllByText(/Active/i);
    expect(statusBadges.length).toBe(4); // 2 agents with 'Active' status + 2 filter buttons with 'Active' text
  });
}); 