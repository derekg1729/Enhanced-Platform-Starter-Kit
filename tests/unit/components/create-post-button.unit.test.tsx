import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreatePostButton from '@/components/create-post-button';
import { trackPost } from '@/lib/analytics';
import * as actions from '@/lib/actions';

// Mock the dependencies
vi.mock('@/lib/analytics', () => ({
  trackPost: {
    create: vi.fn()
  }
}));

// Mock router
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: mockPush
  }),
  useParams: () => ({ id: 'test-site-id' })
}));

// Mock createPost action
const mockCreatePost = vi.fn().mockResolvedValue({ id: 'new-post-id' });
vi.mock('@/lib/actions', () => ({
  createPost: vi.fn().mockImplementation(() => Promise.resolve({ id: 'new-post-id' }))
}));

// Mock useTransition
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useTransition: () => [false, (callback: Function) => callback()]
  };
});

describe('CreatePostButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.createPost).mockResolvedValue({ id: 'new-post-id' });
  });

  it('renders with correct text', () => {
    render(<CreatePostButton />);
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
  });

  it('has correct styling', () => {
    render(<CreatePostButton />);
    const button = screen.getByRole('button');
    
    // Base styling
    expect(button).toHaveClass('flex');
    expect(button).toHaveClass('items-center');
    expect(button).toHaveClass('justify-center');
    expect(button).toHaveClass('rounded-lg');
    
    // Default state styling
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('border-black');
    expect(button).toHaveClass('bg-black');
    expect(button).toHaveClass('text-white');
    
    // Hover/active state classes
    expect(button).toHaveClass('hover:bg-white');
    expect(button).toHaveClass('hover:text-black');
    expect(button).toHaveClass('active:bg-stone-100');
    
    // Dark mode classes
    expect(button).toHaveClass('dark:border-stone-700');
    expect(button).toHaveClass('dark:hover:border-stone-200');
    expect(button).toHaveClass('dark:hover:bg-black');
    expect(button).toHaveClass('dark:hover:text-white');
    expect(button).toHaveClass('dark:active:bg-stone-800');
  });

  it('creates a post and navigates when clicked', async () => {
    render(<CreatePostButton />);
    
    fireEvent.click(screen.getByText('Create New Post'));
    
    // Wait for promises to resolve
    await vi.waitFor(() => {
      expect(actions.createPost).toHaveBeenCalledWith(null, 'test-site-id', null);
      expect(trackPost.create).toHaveBeenCalledWith('test-site-id');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/post/new-post-id');
    });
  });

  it('calls functions in the correct order', async () => {
    // Track the order of function calls
    const calls: string[] = [];
    
    vi.mocked(actions.createPost).mockImplementation(async () => {
      calls.push('createPost');
      return { id: 'new-post-id' };
    });
    
    vi.mocked(trackPost.create).mockImplementation(() => {
      calls.push('trackPost.create');
    });
    
    vi.mocked(mockRefresh).mockImplementation(() => {
      calls.push('router.refresh');
    });
    
    vi.mocked(mockPush).mockImplementation(() => {
      calls.push('router.push');
    });
    
    render(<CreatePostButton />);
    
    fireEvent.click(screen.getByText('Create New Post'));
    
    // Wait for async operations to complete
    await vi.waitFor(() => {
      expect(calls).toEqual(['createPost', 'trackPost.create', 'router.refresh', 'router.push']);
    });
  });
}); 