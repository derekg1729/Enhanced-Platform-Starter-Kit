import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApiKeyForm } from '@/components/api-key-form';
import { createApiConnection } from '@/lib/actions';
import { toast } from 'sonner';

// Mock the actions module
vi.mock('@/lib/actions', () => ({
  createApiConnection: vi.fn(),
}));

// Mock the toast module
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ApiKeyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Basic rendering test
  it('renders correctly', () => {
    render(<ApiKeyForm />);
    
    // Check for form elements
    expect(screen.getByLabelText(/Service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Key Value/i)).toBeInTheDocument();
    
    // Check title and description using heading role
    expect(screen.getByRole('heading', { name: 'Add API Key' })).toBeInTheDocument();
    expect(screen.getByText('Add your API key to use with your agents.')).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByRole('button', { name: 'Add API Key' })).toBeInTheDocument();
  });

  // Test for toggling API key visibility
  it('toggles API key visibility when show/hide button is clicked', () => {
    render(<ApiKeyForm />);
    
    // Get the API key input and verify it's initially a password field
    const apiKeyInput = screen.getByLabelText(/API Key Value/i) as HTMLInputElement;
    expect(apiKeyInput.type).toBe('password');
    
    // Find the toggle button by its aria-label
    const toggleButton = screen.getByRole('button', { name: 'Show API key' });
    
    // Click the toggle button
    fireEvent.click(toggleButton);
    expect(apiKeyInput.type).toBe('text');
    
    // Click again to hide
    fireEvent.click(screen.getByRole('button', { name: 'Hide API key' }));
    expect(apiKeyInput.type).toBe('password');
  });

  // Test for form submission
  it('submits the form with API key data', async () => {
    // Mock successful API key creation
    const mockCreateApiConnection = vi.fn().mockResolvedValue({ id: 'test-id' });
    vi.mocked(createApiConnection).mockImplementation(mockCreateApiConnection);
    
    render(<ApiKeyForm />);
    
    // Fill out the form
    const serviceSelect = screen.getByLabelText(/Service/i);
    const nameInput = screen.getByLabelText(/Name/i);
    const apiKeyInput = screen.getByLabelText(/API Key Value/i);
    const submitButton = screen.getByRole('button', { name: 'Add API Key' });
    
    fireEvent.change(serviceSelect, { target: { value: 'openai' } });
    fireEvent.change(nameInput, { target: { value: 'My Test Key' } });
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });
    
    // Use form submission instead of button click
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Check if createApiConnection was called with the right arguments
    expect(mockCreateApiConnection).toHaveBeenCalledWith(expect.any(FormData));
    
    // Wait for the success message
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('API key added successfully');
    });
  });

  // Test for error handling
  it('shows an error toast when API connection creation fails', async () => {
    // Mock the createApiConnection function to throw an error
    const mockError = new Error('Failed to add API key');
    vi.mocked(createApiConnection).mockRejectedValue(mockError);
    
    render(<ApiKeyForm />);
    
    // Fill out the form
    const apiKeyInput = screen.getByLabelText(/API Key Value/i);
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });
    
    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to add API key');
    });
  });

  // Test for handling exceptions during form submission
  it('handles exceptions during form submission', async () => {
    // Mock exception during API key creation
    const mockCreateApiConnection = vi.fn();
    mockCreateApiConnection.mockRejectedValue(new Error('Network error'));
    
    render(<ApiKeyForm />);
    
    // Fill out the form
    const serviceSelect = screen.getByLabelText(/Service/i);
    const nameInput = screen.getByLabelText(/Name/i);
    const apiKeyInput = screen.getByLabelText(/API Key Value/i);
    
    fireEvent.change(serviceSelect, { target: { value: 'openai' } });
    fireEvent.change(nameInput, { target: { value: 'My Test Key' } });
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });
    
    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to add API key');
    });
  });

  // Test for disabling the submit button during form submission
  it('disables the submit button during form submission', async () => {
    // Mock the createApiConnection function to return a promise we control
    const mockResolve = vi.fn();
    const mockPromise = new Promise(resolve => {
      mockResolve.mockImplementation(() => resolve({ id: '123' }));
    });
    vi.mocked(createApiConnection).mockReturnValue(mockPromise as Promise<any>);
    
    render(<ApiKeyForm />);
    
    // Fill out the form
    const apiKeyInput = screen.getByLabelText(/API Key Value/i);
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });
    
    // Get the submit button before submission
    const submitButton = screen.getByRole('button', { name: 'Add API Key' });
    expect(submitButton).not.toBeDisabled();
    
    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Check if the button is disabled and shows "Adding..."
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Adding...' })).toBeDisabled();
    });
    
    // Resolve the promise to complete the submission
    mockResolve();
    
    // Check if the button is enabled again and shows "Add API Key"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add API Key' })).toBeInTheDocument();
    });
  });

  // Test for resetting the form after successful submission
  it('resets the form after successful submission', async () => {
    // Mock the createApiConnection function with complete object
    vi.mocked(createApiConnection).mockResolvedValue({
      id: '123',
      name: 'Test API Key',
      service: 'openai',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-123',
      encryptedApiKey: 'encrypted-key'
    });
    
    render(<ApiKeyForm />);
    
    // Fill out the form
    const apiKeyInput = screen.getByLabelText(/API Key Value/i);
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });
    
    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Check if success toast was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('API key added successfully');
    });
    
    // Check if the form was reset
    await waitFor(() => {
      expect(apiKeyInput).toHaveValue('');
    });
  });

  // Test for creating a FormData object with correct fields when submitting the form
  it('creates a FormData object with correct fields when submitting the form', async () => {
    // Mock successful API connection creation with complete object
    vi.mocked(createApiConnection).mockResolvedValue({
      id: 'test-id',
      name: 'Test API Key',
      service: 'openai',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-123',
      encryptedApiKey: 'encrypted-key'
    });
    
    render(<ApiKeyForm />);
    
    // Fill out the form
    const serviceSelect = screen.getByLabelText(/Service/i);
    const nameInput = screen.getByLabelText(/Name/i);
    const apiKeyInput = screen.getByLabelText(/API Key Value/i);
    
    fireEvent.change(serviceSelect, { target: { value: 'anthropic' } });
    fireEvent.change(nameInput, { target: { value: 'My Test Key' } });
    fireEvent.change(apiKeyInput, { target: { value: 'sk-ant-test123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Add API Key' });
    fireEvent.click(submitButton);
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Verify that createApiConnection was called with a FormData object
      expect(createApiConnection).toHaveBeenCalled();
      
      // Get the argument passed to createApiConnection
      const formDataArg = vi.mocked(createApiConnection).mock.calls[0][0];
      
      // Verify it's a FormData object
      expect(formDataArg).toBeInstanceOf(FormData);
      
      // Verify the FormData contains the correct values
      expect(formDataArg.get('service')).toBe('anthropic');
      expect(formDataArg.get('name')).toBe('My Test Key');
      expect(formDataArg.get('apiKey')).toBe('sk-ant-test123');
    });
    
    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalledWith('API key added successfully');
  });

  // Test for showing an error toast when submitting without required fields
  it('shows an error toast when submitting without required fields', async () => {
    render(<ApiKeyForm />);
    
    // Get the form and submit it without filling required fields
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Wait for the validation error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
    });
  });
});