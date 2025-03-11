import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Nav from '../../../../components/nav';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '/',
  useSelectedLayoutSegments: () => [],
}));

// Mock lib/actions
vi.mock('@/lib/actions', () => ({
  getSiteFromPostId: vi.fn().mockResolvedValue('site-1'),
}));

describe('Agents Navigation', () => {
  it('should have a link to the agents page with the correct URL', () => {
    render(<Nav>{null}</Nav>);
    
    const agentsLink = screen.getByRole('link', { name: /agents/i });
    expect(agentsLink).toBeInTheDocument();
    
    // The test will fail if the href is incorrect
    // The correct URL should be '/agents' not '/app/agents'
    expect(agentsLink.getAttribute('href')).toBe('/agents');
  });
}); 