import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AgentsPage from '@/app/app/(dashboard)/agents/page';
import DashboardLayout from '@/app/app/(dashboard)/layout';

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
    // Render the AgentsPage component
    const { container: agentsPageContainer } = render(<AgentsPage />);
    
    // Check that the AgentsPage has a title
    expect(screen.getByText('Your Agents')).toBeInTheDocument();
    
    // Now render the AgentsPage within the DashboardLayout
    const { container: dashboardContainer } = render(
      <DashboardLayout>
        <AgentsPage />
      </DashboardLayout>
    );
    
    // Check that the DashboardLayout has the dark theme
    const dashboardElement = dashboardContainer.querySelector('.dark\\:bg-black');
    expect(dashboardElement).toBeInTheDocument();
    
    // Check that the Nav component is rendered
    expect(screen.getByTestId('mock-nav')).toBeInTheDocument();
  });
}); 