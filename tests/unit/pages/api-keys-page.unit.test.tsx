import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ApiKeysPage from '@/app/app/(dashboard)/api-keys/page';
import { notFound } from 'next/navigation';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/components/api-key-form', () => ({
  default: vi.fn(() => <div data-testid="api-key-form">API Key Form</div>),
}));

vi.mock('@/components/api-connections-list', () => ({
  default: vi.fn(() => <div data-testid="api-connections-list">API Connections List</div>),
}));

vi.mock('@/components/create-api-key-button', () => ({
  default: vi.fn(({ children }) => (
    <div data-testid="create-api-key-button">
      {children}
    </div>
  )),
}));

vi.mock('@/components/modal/create-api-key', () => ({
  default: vi.fn(() => <div data-testid="create-api-key-modal">Create API Key Modal</div>),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Import mocks after they've been defined
import { getSession } from '@/lib/auth';

describe('ApiKeysPage', () => {
  it('renders the API keys page with components when authenticated', async () => {
    // Mock authenticated session
    vi.mocked(getSession).mockResolvedValue({
      user: { 
        id: 'user-123', 
        name: 'Test User', 
        email: 'test@example.com',
        username: 'testuser',
        image: 'https://example.com/avatar.png'
      }
    });

    const page = await ApiKeysPage();
    render(page);
    
    // Check page title and description
    expect(screen.getByText('API Keys')).toBeInTheDocument();
    expect(screen.getByText('Manage your API keys for different AI services.')).toBeInTheDocument();
    
    // Check back link
    expect(screen.getByText('Back to Agents')).toBeInTheDocument();
    
    // Check components are rendered
    expect(screen.getByTestId('create-api-key-button')).toBeInTheDocument();
    expect(screen.getByTestId('api-connections-list')).toBeInTheDocument();
  });

  it('returns not found when not authenticated', async () => {
    // Mock unauthenticated session
    vi.mocked(getSession).mockResolvedValue(null);

    await ApiKeysPage();
    
    // Verify notFound was called
    expect(notFound).toHaveBeenCalled();
  });
}); 