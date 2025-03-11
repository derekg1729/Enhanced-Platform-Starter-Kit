import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import AgentDetailsPage from '../../../app/app/(dashboard)/agents/[id]/page';
import CreateAgentPage from '../../../app/app/(dashboard)/agents/new/page';

// Mock the next/link component
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => (
      <a href={href}>{children}</a>
    ),
  };
});

// Mock the AgentChatInterface component
vi.mock('../../../components/agent/AgentChatInterface', () => {
  return {
    __esModule: true,
    default: ({ agentId }: { agentId: string }) => (
      <div data-testid="agent-chat-interface">
        Chat interface for agent: {agentId}
      </div>
    ),
  };
});

// Mock the AgentCreationForm component
vi.mock('../../../components/agent/AgentCreationForm', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="agent-creation-form">Agent Creation Form</div>,
  };
});

describe('Agent Navigation', () => {
  it('should have correct "Back to agents" link in agent details page', () => {
    render(<AgentDetailsPage params={{ id: 'test-agent-123' }} />);
    
    const backLink = screen.getByText('Back to agents');
    expect(backLink).toBeInTheDocument();
    expect(backLink.getAttribute('href')).toBe('/agents');
  });

  it('should have correct "Back to agents" link in create agent page', () => {
    render(<CreateAgentPage />);
    
    const backLink = screen.getByText('Back to agents');
    expect(backLink).toBeInTheDocument();
    expect(backLink.getAttribute('href')).toBe('/agents');
  });
}); 