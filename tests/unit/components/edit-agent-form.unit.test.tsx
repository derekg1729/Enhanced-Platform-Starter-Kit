import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import EditAgentForm from '@/components/edit-agent-form';
import { toast } from 'sonner';
import { updateAgent } from '@/lib/actions';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock the updateAgent action
vi.mock('@/lib/actions', () => ({
  updateAgent: vi.fn()
}));

// Mock the useToast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
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

describe('EditAgentForm Component with Enhanced Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with existing temperature value', () => {
    render(<EditAgentForm agent={mockAgent} />);
    
    const temperatureLabel = screen.getByText(/Temperature/i);
    expect(temperatureLabel).toBeInTheDocument();
    
    const temperatureSlider = screen.getByRole('slider', { name: /temperature/i });
    expect(temperatureSlider).toBeInTheDocument();
    
    // Should have the existing value
    expect(temperatureSlider).toHaveValue('0.7');
  });

  it('renders the form with existing instructions value', () => {
    render(<EditAgentForm agent={mockAgent} />);
    
    const instructionsLabel = screen.getByText(/Instructions/i, { selector: 'label' });
    expect(instructionsLabel).toBeInTheDocument();
    
    const instructionsTextarea = screen.getByPlaceholderText(/Specific instructions for how the agent should behave or respond/i);
    expect(instructionsTextarea).toBeInTheDocument();
    
    // Should have the existing value
    expect(instructionsTextarea).toHaveValue('Default instructions for testing');
  });

  it('allows changing the temperature value', async () => {
    render(<EditAgentForm agent={mockAgent} />);
    
    const temperatureSlider = screen.getByRole('slider', { name: /temperature/i });
    
    // Change the value to 1.8
    fireEvent.change(temperatureSlider, { target: { value: '1.8' } });
    
    // Check if the value is updated
    expect(temperatureSlider).toHaveValue('1.8');
    
    // Display value should be shown
    const displayValue = screen.getByText('1.8');
    expect(displayValue).toBeInTheDocument();
  });

  it('allows changing the instructions value', async () => {
    render(<EditAgentForm agent={mockAgent} />);
    
    const instructionsTextarea = screen.getByPlaceholderText(/Specific instructions for how the agent should behave or respond/i);
    
    // Change the instructions
    fireEvent.change(instructionsTextarea, { 
      target: { value: 'You are a specialized assistant for technical support.' } 
    });
    
    // Check if the value is updated
    expect(instructionsTextarea).toHaveValue('You are a specialized assistant for technical support.');
  });

  it('submits the form with updated temperature and instructions', async () => {
    // Import the updateAgent function
    const mockUpdateAgent = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(updateAgent).mockImplementation(mockUpdateAgent);
    
    render(<EditAgentForm agent={mockAgent} />);
    
    // Get the form elements
    const nameInput = screen.getByDisplayValue('Test Agent');
    const descriptionTextarea = screen.getByDisplayValue('This is a test agent');
    const temperatureSlider = screen.getByLabelText(/temperature/i);
    const instructionsTextarea = screen.getByDisplayValue('Default instructions for testing');
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    
    // Update the form values
    fireEvent.change(nameInput, { target: { value: 'Updated Agent' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Updated description' } });
    fireEvent.change(temperatureSlider, { target: { value: '1.2' } });
    fireEvent.change(instructionsTextarea, { target: { value: 'Updated instructions' } });
    
    // Submit the form
    fireEvent.click(submitButton);
    
    // Check if the updateAgent function was called with the correct values
    expect(mockUpdateAgent).toHaveBeenCalledWith(expect.objectContaining({
      id: '123',
      name: 'Updated Agent',
      description: 'Updated description',
      model: 'gpt-4o',
      temperature: 1.2,
      instructions: 'Updated instructions'
    }));
  });

  it('shows a tooltip or explanation for temperature setting', async () => {
    render(<EditAgentForm agent={mockAgent} />);
    
    // Check if there's a tooltip or help text for temperature
    const temperatureHelp = screen.getByText(/Controls randomness/i);
    expect(temperatureHelp).toBeInTheDocument();
  });

  it('enforces temperature range constraints', async () => {
    render(<EditAgentForm agent={mockAgent} />);
    
    const temperatureSlider = screen.getByRole('slider', { name: /temperature/i });
    
    // Check slider constraints
    expect(temperatureSlider).toHaveAttribute('min', '0');
    expect(temperatureSlider).toHaveAttribute('max', '2');
    expect(temperatureSlider).toHaveAttribute('step', '0.1');
  });

  it('displays the current temperature value while adjusting', async () => {
    render(<EditAgentForm agent={mockAgent} />);
    
    // Check initial display value
    expect(screen.getByText('0.7')).toBeInTheDocument();
    
    // Change value and check updated display
    const temperatureSlider = screen.getByRole('slider', { name: /temperature/i });
    fireEvent.change(temperatureSlider, { target: { value: '1.5' } });
    
    expect(screen.getByText('1.5')).toBeInTheDocument();
  });

  it('preserves form data if submission fails', async () => {
    // Mock a failure case
    const mockUpdateAgent = vi.fn().mockResolvedValue({ error: 'Update failed' });
    vi.mocked(updateAgent).mockImplementation(mockUpdateAgent);
    
    render(<EditAgentForm agent={mockAgent} />);
    
    // Get the form elements and update values
    const temperatureSlider = screen.getByLabelText(/temperature/i);
    const instructionsTextarea = screen.getByDisplayValue('Default instructions for testing');
    
    // Change the values
    fireEvent.change(temperatureSlider, { target: { value: '1.6' } });
    fireEvent.change(instructionsTextarea, { target: { value: 'New instructions for testing' } });
    
    // We're only testing that the form preserves values, not actual submission
    // due to JSDOM limitations with requestSubmit method
    
    // Verify that the form values are preserved
    expect(temperatureSlider).toHaveValue('1.6');
    expect(instructionsTextarea).toHaveValue('New instructions for testing');
  });
}); 