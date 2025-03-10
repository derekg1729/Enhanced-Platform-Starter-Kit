import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentsPage from '../../../../app/app/(dashboard)/agents/page';
import AgentsPageClient from '../../../../app/app/(dashboard)/agents/AgentsPageClient';

// Mock the AgentsPageClient component
vi.mock('../../../../app/app/(dashboard)/agents/AgentsPageClient', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="agents-page-client">Mocked AgentsPageClient</div>),
}));

describe('AgentsPage', () => {
  it('renders the AgentsPageClient component', () => {
    render(<AgentsPage />);
    expect(screen.getByTestId('agents-page-client')).toBeInTheDocument();
    expect(screen.getByText('Mocked AgentsPageClient')).toBeInTheDocument();
  });

  it('passes no props to AgentsPageClient', () => {
    render(<AgentsPage />);
    expect(AgentsPageClient).toHaveBeenCalledWith({}, {});
  });
}); 