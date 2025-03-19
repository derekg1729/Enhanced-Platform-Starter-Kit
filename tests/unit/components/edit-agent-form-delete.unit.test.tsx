import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EditAgentForm from '@/components/edit-agent-form';
import { toast } from 'sonner';
import { deleteAgent } from '@/lib/actions';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock the actions
vi.mock('@/lib/actions', () => ({
  updateAgent: vi.fn(),
  deleteAgent: vi.fn()
}));

// Mock the DeleteConfirmationDialog component
vi.mock('@/components/delete-confirmation-dialog', () => ({
  DeleteConfirmationDialog: ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    entityName, 
    isDeleting 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    title: string; 
    entityName: string; 
    isDeleting: boolean;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="delete-dialog">
        <div>{title}</div>
        <div>Are you sure you want to delete &quot;{entityName}&quot;? This action cannot be undone.</div>
        <button onClick={onClose} data-testid="cancel-button">Cancel</button>
        <button onClick={onConfirm} data-testid="confirm-button" disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    );
  }
}));

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

// Test agent data
const mockAgent = {
  id: '123',
  name: 'Test Agent',
  description: 'This is a test agent',
  model: 'gpt-4o',
  userId: 'user123',
  createdAt: new Date(),
  updatedAt: new Date(),
  temperature: 0.7,
  instructions: 'Default instructions for testing'
};

describe('EditAgentForm Delete Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a delete button', () => {
    render(<EditAgentForm agent={mockAgent} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
    
    // Check if the button has the correct styling (red for destructive action)
    expect(deleteButton).toHaveClass('bg-red-600');
  });

  it('shows confirmation dialog when delete button is clicked', () => {
    render(<EditAgentForm agent={mockAgent} />);
    
    // Initially, dialog should not be in the document
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    
    // Click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Dialog should be shown
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete "Test Agent"/i)).toBeInTheDocument();
  });

  it('does not delete the agent when confirmation is canceled', async () => {
    render(<EditAgentForm agent={mockAgent} />);
    
    // Click the delete button to open dialog
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Click the cancel button
    fireEvent.click(screen.getByTestId('cancel-button'));
    
    // Deletion should be canceled and deleteAgent should not be called
    expect(deleteAgent).not.toHaveBeenCalled();
    
    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    });
  });

  it('deletes the agent when confirmation is accepted', async () => {
    // Mock successful deletion
    const mockDeleteAgent = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(deleteAgent).mockImplementation(mockDeleteAgent);
    
    render(<EditAgentForm agent={mockAgent} />);
    
    // Click the delete button to open dialog
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Click the confirm button
    fireEvent.click(screen.getByTestId('confirm-button'));
    
    // Deletion should be initiated
    await waitFor(() => {
      expect(deleteAgent).toHaveBeenCalledWith('123');
    });
    
    // Success toast should be shown
    expect(toast.success).toHaveBeenCalledWith('Agent deleted successfully');
  });

  it('shows error toast when deletion fails', async () => {
    // Mock failed deletion
    const mockDeleteAgent = vi.fn().mockResolvedValue({ error: 'Failed to delete agent' });
    vi.mocked(deleteAgent).mockImplementation(mockDeleteAgent);
    
    render(<EditAgentForm agent={mockAgent} />);
    
    // Click the delete button to open dialog
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Click the confirm button
    fireEvent.click(screen.getByTestId('confirm-button'));
    
    // Deletion should be initiated
    await waitFor(() => {
      expect(deleteAgent).toHaveBeenCalledWith('123');
    });
    
    // Error toast should be shown
    expect(toast.error).toHaveBeenCalledWith('Failed to delete agent');
  });

  it('handles unexpected errors during deletion', async () => {
    // Mock error during deletion
    const mockDeleteAgent = vi.fn().mockRejectedValue(new Error('Unexpected error'));
    vi.mocked(deleteAgent).mockImplementation(mockDeleteAgent);
    
    render(<EditAgentForm agent={mockAgent} />);
    
    // Click the delete button to open dialog
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Click the confirm button
    fireEvent.click(screen.getByTestId('confirm-button'));
    
    // Deletion should be initiated but fail
    await waitFor(() => {
      expect(deleteAgent).toHaveBeenCalledWith('123');
    });
    
    // Error toast should be shown
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Error deleting agent: Unexpected error'));
  });
}); 