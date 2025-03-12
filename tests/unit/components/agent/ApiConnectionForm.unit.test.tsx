import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ApiConnectionForm from '@/components/agent/ApiConnectionForm';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn()
  })
}));

describe('ApiConnectionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch API
    global.fetch = vi.fn();
    
    // Mock successful API services response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          id: 'openai',
          name: 'OpenAI',
          description: 'OpenAI API',
          url: 'https://api.openai.com',
          models: ['gpt-3.5-turbo', 'gpt-4'],
          keyFormat: 'sk-[A-Za-z0-9]{48}',
          keyName: 'OpenAI API Key',
          keyInstructions: 'Get your API key from OpenAI dashboard'
        },
        {
          id: 'anthropic',
          name: 'Anthropic',
          description: 'Anthropic API',
          url: 'https://api.anthropic.com',
          models: ['claude-2', 'claude-instant-1'],
          keyFormat: 'sk-ant-[A-Za-z0-9]{48}',
          keyName: 'Anthropic API Key',
          keyInstructions: 'Get your API key from Anthropic dashboard'
        }
      ])
    });
  });

  it('renders the form with proper styling', async () => {
    render(<ApiConnectionForm />);
    
    // Wait for services to load
    await waitFor(() => {
      expect(screen.getByLabelText(/service/i)).toBeInTheDocument();
    });
    
    // Check that the select element is rendered with proper styling
    const selectElement = screen.getByLabelText(/service/i);
    expect(selectElement).toBeInTheDocument();
    
    // The select element should use the standardized Select component
    // which should have appropriate styling for dark mode
    expect(selectElement).not.toHaveClass('bg-background');
    
    // The select element should have text that is visible against its background
    const computedStyle = window.getComputedStyle(selectElement);
    expect(computedStyle.color).not.toBe(computedStyle.backgroundColor);
  });

  it('displays service options correctly', async () => {
    render(<ApiConnectionForm />);
    
    // Wait for services to load
    await waitFor(() => {
      expect(screen.getByLabelText(/service/i)).toBeInTheDocument();
    });
    
    // Check that service options are rendered
    const selectElement = screen.getByLabelText(/service/i);
    expect(selectElement).toBeInTheDocument();
    
    // Open the dropdown
    fireEvent.click(selectElement);
    
    // Check that both services are in the document
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    // Mock successful form submission
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-connection-id' })
    });
    
    render(<ApiConnectionForm />);
    
    // Wait for services to load
    await waitFor(() => {
      expect(screen.getByLabelText(/service/i)).toBeInTheDocument();
    });
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/connection name/i), {
      target: { value: 'My API Connection' }
    });
    
    fireEvent.change(screen.getByLabelText(/service/i), {
      target: { value: 'openai' }
    });
    
    fireEvent.change(screen.getByLabelText(/api key/i), {
      target: { value: 'sk-abcdefghijklmnopqrstuvwxyz1234567890abcdefghijkl' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create connection/i }));
    
    // Check that fetch was called with the correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/api-connections',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            name: 'My API Connection',
            service: 'openai',
            apiKey: 'sk-abcdefghijklmnopqrstuvwxyz1234567890abcdefghijkl'
          })
        })
      );
    });
  });
}); 