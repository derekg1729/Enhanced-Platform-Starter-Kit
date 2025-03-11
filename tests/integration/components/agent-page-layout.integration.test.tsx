import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import AgentsPage from '@/app/app/(dashboard)/agents/page';
import DashboardLayout from '@/app/app/(dashboard)/layout';
import AgentsPageClient from '@/app/app/(dashboard)/agents/AgentsPageClient';

// Mock the Nav component since it contains client components
vi.mock('@/components/nav', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-nav">
      <div data-testid="nav-content">{children}</div>
    </div>
  ),
}));

// Mock the Profile component
vi.mock('@/components/profile', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-profile">Profile</div>,
}));

describe('Agent Page Layout', () => {
  it('should be placed under the dashboard layout', () => {
    // First render the AgentsPage by itself
    render(<AgentsPageClient initialLoading={true} testMode={true} />);
    
    // Check that the AgentsPage has a title
    expect(screen.getAllByText('Your Agents')[0]).toBeInTheDocument();
    
    // Now render the AgentsPage within the DashboardLayout
    cleanup();
    render(
      <DashboardLayout>
        <AgentsPageClient initialLoading={true} testMode={true} />
      </DashboardLayout>
    );
    
    // Check that the AgentsPage is rendered within the DashboardLayout
    expect(screen.getAllByText('Your Agents')[0]).toBeInTheDocument();
    // Check for elements that are unique to the DashboardLayout
    expect(screen.getByTestId('mock-nav')).toBeInTheDocument();
    expect(screen.getByTestId('mock-profile')).toBeInTheDocument();
  });
}); 