import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AgentCreationForm from '../../../../components/agent/AgentCreationForm';
import { useRouter } from 'next/navigation';

// Mock the next/navigation router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('AgentCreationForm', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('renders the form with all required fields', () => {
    render(<AgentCreationForm />);
    
    // Check for form elements
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prompt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create agent/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<AgentCreationForm />);
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /create agent/i }));
    
    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/prompt is required/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    const mockOnSubmit = vi.fn().mockImplementation(async () => {});
    render(<AgentCreationForm onSubmit={mockOnSubmit} />);
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/name/i), 'Test Agent');
    await userEvent.type(screen.getByLabelText(/description/i), 'This is a test agent');
    await userEvent.type(screen.getByLabelText(/prompt/i), 'You are a helpful assistant');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create agent/i }));
    
    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Agent',
        description: 'This is a test agent',
        prompt: 'You are a helpful assistant',
        model: 'gpt-3.5-turbo', // Default value
        temperature: 0.7, // Default value
      });
    });
  });

  it('navigates back to agents page when cancel is clicked', () => {
    render(<AgentCreationForm />);
    
    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Check if router.push was called with the correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/agents');
  });

  it('shows loading state during form submission', async () => {
    const mockOnSubmit = vi.fn().mockImplementation(() => new Promise<void>(resolve => setTimeout(() => resolve(), 100)));
    render(<AgentCreationForm onSubmit={mockOnSubmit} />);
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/name/i), 'Test Agent');
    await userEvent.type(screen.getByLabelText(/description/i), 'This is a test agent');
    await userEvent.type(screen.getByLabelText(/prompt/i), 'You are a helpful assistant');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create agent/i }));
    
    // Check for loading state - the button should have a loading spinner
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /create agent/i });
      expect(submitButton).toBeDisabled();
      // Check for the loading spinner SVG
      const loadingSpinner = document.querySelector('svg.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('displays error message when form submission fails', async () => {
    const mockOnSubmit = vi.fn().mockImplementation(() => Promise.reject(new Error('Submission failed')));
    render(<AgentCreationForm onSubmit={mockOnSubmit} />);
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/name/i), 'Test Agent');
    await userEvent.type(screen.getByLabelText(/description/i), 'This is a test agent');
    await userEvent.type(screen.getByLabelText(/prompt/i), 'You are a helpful assistant');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create agent/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create agent/i)).toBeInTheDocument();
    });
  });
}); 