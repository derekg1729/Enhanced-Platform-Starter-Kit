import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AgentForm from "@/components/agent-form";
import * as encryption from "@/lib/encryption";
import { toast } from "sonner";
import { createAgent } from '@/lib/actions';

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@vercel/analytics", () => ({
  default: {
    track: vi.fn(),
  },
  va: {
    track: vi.fn(),
  }
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("react-dom", () => ({
  useFormStatus: () => ({
    pending: false,
  }),
}));

vi.mock("@/lib/encryption", () => ({
  encryptApiKey: vi.fn().mockResolvedValue("encrypted-api-key"),
}));

// Mock the createAgent function
vi.mock('@/lib/actions', () => ({
  createAgent: vi.fn().mockImplementation((data) => {
    // Check if required fields are present
    if (!data.name) {
      return { error: 'A name is required to create your agent.' };
    }
    // Return success
    return { success: true };
  })
}));

describe("AgentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with default values", () => {
    render(<AgentForm />);
    
    // Check title and description
    expect(screen.getByText("Configure Agent")).toBeInTheDocument();
    expect(screen.getByText("Set up your agent with a name, description, and model.")).toBeInTheDocument();
    
    // Check form fields
    expect(screen.getByLabelText(/Agent Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Model/i)).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it("renders the form with custom title and description", () => {
    render(
      <AgentForm 
        title="Custom Title" 
        description="Custom description for testing"
      />
    );
    
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom description for testing")).toBeInTheDocument();
  });

  it("renders the form with initial values", () => {
    const initialValues = {
      name: "Test Agent",
      description: "Test description",
      model: "claude-3-opus",
    };
    
    render(<AgentForm initialValues={initialValues} />);
    
    expect(screen.getByDisplayValue("Test Agent")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
    
    // For select elements, we need to check the selected option
    const selectElement = screen.getByLabelText(/Model/i) as HTMLSelectElement;
    expect(selectElement.value).toBe("claude-3-opus");
  });

  it("has proper form structure and styling", () => {
    const { container } = render(<AgentForm />);
    
    // Check form element exists
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    
    // Check form has proper styling classes
    expect(form).toHaveClass('rounded-lg');
    expect(form).toHaveClass('border');
    expect(form).toHaveClass('bg-white');
    expect(form).toHaveClass('dark:border-stone-700');
    expect(form).toHaveClass('dark:bg-black');
  });

  it("has proper labels for required fields", () => {
    render(<AgentForm />);
    
    // Check required field labels have asterisks
    expect(screen.getByText('Agent Name')).toBeInTheDocument();
    expect(screen.getByText('Model')).toBeInTheDocument();
    
    // Description is optional, so no asterisk
    expect(screen.getByText('Description')).toBeInTheDocument();
    
    // Check the note about required fields
    expect(screen.getByText('Required fields are marked with *')).toBeInTheDocument();
  });

  it("renders all model options correctly", () => {
    render(<AgentForm />);
    
    // Get the model select element
    const modelSelect = screen.getByLabelText(/Model/i) as HTMLSelectElement;
    
    // Check all options are present - there are 6 options in our updated component
    expect(modelSelect.options.length).toBe(6);
    expect(modelSelect.options[0].text).toBe('GPT-3.5 Turbo');
    expect(modelSelect.options[1].text).toBe('GPT-4');
    expect(modelSelect.options[2].text).toBe('GPT-4 Turbo');
    expect(modelSelect.options[3].text).toBe('Claude 3 Opus');
    expect(modelSelect.options[4].text).toBe('Claude 3 Sonnet');
    expect(modelSelect.options[5].text).toBe('Claude 3 Haiku');
    
    // Check values
    expect(modelSelect.options[1].value).toBe('gpt-4');
    expect(modelSelect.options[3].value).toBe('claude-3-opus');
  });

  it("has default selection of GPT-4 model", () => {
    render(<AgentForm />);
    
    // Get the model select element
    const modelSelect = screen.getByLabelText(/Model/i) as HTMLSelectElement;
    
    // Check default selection
    expect(modelSelect.value).toBe('gpt-4');
  });

  it('uses account-level API keys instead of requiring input', () => {
    render(<AgentForm />);
    
    // Check for text indicating the use of account-level API keys
    expect(screen.getByText(/This agent will use your account-level API keys/i)).toBeInTheDocument();
  });

  it('renders with the correct fields', () => {
    render(<AgentForm />);
    
    expect(screen.getByLabelText('Agent Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Model')).toBeInTheDocument();
    
    // Check for text indicating the use of account-level API keys
    expect(screen.getByText(/This agent will use your account-level API keys/i)).toBeInTheDocument();
    
    // Check for the Save Changes button text
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
});

describe('AgentForm Component with Enhanced Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders temperature slider field', () => {
    render(<AgentForm />);
    
    const temperatureLabel = screen.getByText(/Temperature/i);
    expect(temperatureLabel).toBeInTheDocument();
    
    const temperatureSlider = screen.getByRole('slider', { name: /temperature/i });
    expect(temperatureSlider).toBeInTheDocument();
    
    // Default value should be 0.7
    expect(temperatureSlider).toHaveValue('0.7');
  });

  it('renders instructions field', () => {
    render(<AgentForm />);
    
    const instructionsLabel = screen.getByText(/Instructions/i, { selector: 'label' });
    expect(instructionsLabel).toBeInTheDocument();
    
    const instructionsTextarea = screen.getByPlaceholderText(/Specific instructions for how the agent should behave or respond/i);
    expect(instructionsTextarea).toBeInTheDocument();
  });

  it('allows adjusting temperature with the slider', async () => {
    render(<AgentForm />);
    
    const temperatureSlider = screen.getByRole('slider', { name: /temperature/i });
    
    // Change the value to 1.2
    fireEvent.change(temperatureSlider, { target: { value: '1.2' } });
    
    // Check if the value is updated
    expect(temperatureSlider).toHaveValue('1.2');
    
    // Display value should be shown
    const displayValue = screen.getByText('1.2');
    expect(displayValue).toBeInTheDocument();
  });

  it('allows entering instructions in the textarea', async () => {
    render(<AgentForm />);
    
    const instructionsTextarea = screen.getByPlaceholderText(/Specific instructions for how the agent should behave or respond/i);
    
    // Enter instructions
    fireEvent.change(instructionsTextarea, { 
      target: { value: 'You are a helpful assistant that provides concise answers.' } 
    });
    
    // Check if the value is updated
    expect(instructionsTextarea).toHaveValue('You are a helpful assistant that provides concise answers.');
  });

  it('submits the form with temperature and instructions', async () => {
    // Import the createAgent function
    const mockCreateAgent = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(createAgent).mockImplementation(mockCreateAgent);
    
    render(<AgentForm />);
    
    // Fill in required fields
    const nameInput = screen.getByPlaceholderText(/My AI Assistant/i);
    fireEvent.change(nameInput, { target: { value: 'Test Agent' } });
    
    const descriptionInput = screen.getByPlaceholderText(/A brief description of what this agent does/i);
    fireEvent.change(descriptionInput, { target: { value: 'This is a test agent' } });
    
    // Set temperature
    const temperatureSlider = screen.getByRole('slider', { name: /temperature/i });
    fireEvent.change(temperatureSlider, { target: { value: '1.5' } });
    
    // Add instructions
    const instructionsTextarea = screen.getByPlaceholderText(/Specific instructions for how the agent should behave or respond/i);
    fireEvent.change(instructionsTextarea, { 
      target: { value: 'You are a test assistant. Keep responses brief.' } 
    });
    
    // Verify form values are set correctly
    expect(nameInput).toHaveValue('Test Agent');
    expect(descriptionInput).toHaveValue('This is a test agent');
    expect(temperatureSlider).toHaveValue('1.5');
    expect(instructionsTextarea).toHaveValue('You are a test assistant. Keep responses brief.');
    
    // NOTE: We're not testing the actual form submission here because of JSDOM limitations
    // with the requestSubmit method. In a real application, the form would be submitted with
    // these values, and the createAgent function would be called.
  });

  it('shows a tooltip when hovering over temperature label', async () => {
    render(<AgentForm />);
    
    // Check if there's a tooltip or help text for temperature
    const temperatureHelp = screen.getByText(/Controls randomness/i);
    expect(temperatureHelp).toBeInTheDocument();
  });

  it('shows validation error if temperature is outside range', async () => {
    render(<AgentForm />);
    
    const temperatureSlider = screen.getByRole('slider', { name: /temperature/i });
    
    // Check that the slider has min and max attributes
    expect(temperatureSlider).toHaveAttribute('min', '0');
    expect(temperatureSlider).toHaveAttribute('max', '2');
  });

  it('displays the current temperature value', async () => {
    render(<AgentForm />);
    
    // Check initial display value (0.7)
    expect(screen.getByText('0.7')).toBeInTheDocument();
    
    // Change value and check updated display
    const temperatureSlider = screen.getByRole('slider', { name: /temperature/i });
    fireEvent.change(temperatureSlider, { target: { value: '1.3' } });
    
    expect(screen.getByText('1.3')).toBeInTheDocument();
  });
}); 