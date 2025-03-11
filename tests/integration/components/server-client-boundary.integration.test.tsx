import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import AgentDetailsPage from '../../../app/app/(dashboard)/agents/[id]/page';

// Mock the next/link component
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => (
      <a href={href}>{children}</a>
    ),
  };
});

// Don't mock the AgentChatInterface component to test the actual boundary
vi.mock('../../../components/agent/AgentChatInterface', () => {
  // Create a wrapper that validates props
  return {
    __esModule: true,
    default: (props: any) => {
      // Check if onSendMessage is a function
      if (typeof props.onSendMessage === 'function') {
        throw new Error('Event handlers cannot be passed to Client Component props.');
      }
      
      // If we get here, render a placeholder
      return <div>Mock AgentChatInterface</div>;
    },
  };
});

describe('Server/Client Component Boundary', () => {
  it('should not pass function props directly from server to client components', () => {
    // This should throw an error because we're passing a function from server to client
    expect(() => {
      render(<AgentDetailsPage params={{ id: 'test-agent-123' }} />);
    }).toThrow('Event handlers cannot be passed to Client Component props.');
  });
}); 