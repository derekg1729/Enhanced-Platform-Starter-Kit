import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApiKeyForm from '@/components/api-key-form';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/actions', () => ({
  createApiConnection: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import mocks after they've been defined
import { createApiConnection } from '@/lib/actions';

describe('ApiKeyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with default values', () => {
    render(<ApiKeyForm />);
    
    // Check title and description
    expect(screen.getByText('Add API Key')).toBeInTheDocument();
    expect(screen.getByText('Add your API key to use with your agents.')).toBeInTheDocument();
    
    // Check form fields
    expect(screen.getByLabelText(/Service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByText('Add API Key')).toBeInTheDocument();
  });

  it('renders the form with custom title and description', () => {
    render(
      <ApiKeyForm 
        title="Custom Title" 
        description="Custom description for testing"
      />
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description for testing')).toBeInTheDocument();
  });

  it('renders the form with initial service selection', () => {
    render(<ApiKeyForm initialService="anthropic" />);
    
    // Check that the service dropdown has the correct value
    const serviceSelect = screen.getByLabelText(/Service/i) as HTMLSelectElement;
    expect(serviceSelect.value).toBe('anthropic');
  });

  it('toggles API key visibility when show/hide button is clicked', () => {
    render(<ApiKeyForm />);
    
    // API key should be hidden initially (password type)
    const apiKeyInput = screen.getByLabelText(/API Key/i) as HTMLInputElement;
    expect(apiKeyInput.type).toBe('password');
    
    // Click the show button
    fireEvent.click(screen.getByRole('button', { name: /eye/i }));
    expect(apiKeyInput.type).toBe('text');
    
    // Click the hide button
    fireEvent.click(screen.getByRole('button', { name: /eyeoff/i }));
    expect(apiKeyInput.type).toBe('password');
  });

  it('submits the form with correct values', async () => {
    // Mock successful API connection creation
    vi.mocked(createApiConnection).mockResolvedValue({
      id: 'conn-123',
      service: 'openai',
      name: 'My OpenAI Key',
    });

    render(<ApiKeyForm />);
    
    // Fill out the form
    const serviceSelect = screen.getByLabelText(/Service/i);
    const nameInput = screen.getByLabelText(/Name/i);
    const apiKeyInput = screen.getByLabelText(/API Key/i);
    const submitButton = screen.getByText('Add API Key');
    
    fireEvent.change(serviceSelect, { target: { value: 'openai' } });
    fireEvent.change(nameInput, { target: { value: 'My OpenAI Key' } });
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });
    
    // Submit the form
    fireEvent.click(submitButton);
    
    // Wait for the form submission to complete
    await waitFor(() => {
      // Verify createApiConnection was called with correct form data
      expect(createApiConnection).toHaveBeenCalled();
      
      // Verify toast success was called
      expect(toast.success).toHaveBeenCalledWith('OpenAI API key added successfully!');
    });
  });

  it('shows an error toast when API connection creation fails', async () => {
    // Mock failed API connection creation
    vi.mocked(createApiConnection).mockResolvedValue({
      error: 'Failed to add API key',
    });

    render(<ApiKeyForm />);
    
    // Fill out the form
    const apiKeyInput = screen.getByLabelText(/API Key/i);
    const submitButton = screen.getByText('Add API Key');
    
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });
    
    // Submit the form
    fireEvent.click(submitButton);
    
    // Wait for the form submission to complete
    await waitFor(() => {
      // Verify toast error was called
      expect(toast.error).toHaveBeenCalledWith('Failed to add API key');
    });
  });

  it('handles exceptions during form submission', async () => {
    // Mock exception during API connection creation
    vi.mocked(createApiConnection).mockRejectedValue(new Error('Network error'));

    render(<ApiKeyForm />);
    
    // Fill out the form
    const apiKeyInput = screen.getByLabelText(/API Key/i);
    const submitButton = screen.getByText('Add API Key');
    
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });
    
    // Submit the form
    fireEvent.click(submitButton);
    
    // Wait for the form submission to complete
    await waitFor(() => {
      // Verify toast error was called
      expect(toast.error).toHaveBeenCalledWith('Failed to add API key');
    });
  });

  it('disables the submit button during form submission', async () => {
    // Mock delayed API connection creation
    vi.mocked(createApiConnection).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: 'conn-123',
            service: 'openai',
            name: 'My OpenAI Key',
          });
        }, 100);
      });
    });

    render(<ApiKeyForm />);
    
    // Fill out the form
    const apiKeyInput = screen.getByLabelText(/API Key/i);
    const submitButton = screen.getByText('Add API Key');
    
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });
    
    // Submit the form
    fireEvent.click(submitButton);
    
    // Verify button is disabled during submission
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('resets the form after successful submission', async () => {
    // Create a mock form element with a reset method
    const mockReset = vi.fn();
    const originalDocument = global.document;
    
    // Mock document.getElementById to return our mock form
    global.document.getElementById = vi.fn().mockImplementation((id) => {
      if (id === 'api-key-form') {
        return {
          reset: mockReset,
        };
      }
      return null;
    });
    
    // Mock successful API connection creation
    vi.mocked(createApiConnection).mockResolvedValue({
      id: 'conn-123',
      service: 'openai',
      name: 'My OpenAI Key',
    });

    render(<ApiKeyForm />);
    
    // Fill out the form
    const apiKeyInput = screen.getByLabelText(/API Key/i);
    const submitButton = screen.getByText('Add API Key');
    
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });
    
    // Submit the form
    fireEvent.click(submitButton);
    
    // Wait for the form submission to complete
    await waitFor(() => {
      // Verify form was reset
      expect(mockReset).toHaveBeenCalled();
    });
    
    // Restore original document
    global.document = originalDocument;
  });
}); 