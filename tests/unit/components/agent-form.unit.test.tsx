import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AgentForm from "@/components/agent-form";
import * as encryption from "@/lib/encryption";
import { toast } from "sonner";

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

describe("AgentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with default values", () => {
    render(<AgentForm />);
    
    // Check title and description
    expect(screen.getByText("Configure Agent")).toBeInTheDocument();
    expect(screen.getByText("Set up your agent with the necessary API keys and configuration.")).toBeInTheDocument();
    
    // Check form fields
    expect(screen.getByLabelText(/Agent Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Model/i)).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByText("Save Configuration")).toBeInTheDocument();
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
      apiKey: "sk-test123",
      model: "claude-3-opus",
    };
    
    render(<AgentForm initialValues={initialValues} />);
    
    expect(screen.getByDisplayValue("Test Agent")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
    // API key is hidden by default, so we can't check its display value
    
    // For select elements, we need to check the selected option
    const selectElement = screen.getByLabelText(/Model/i) as HTMLSelectElement;
    expect(selectElement.value).toBe("claude-3-opus");
  });

  it("toggles API key visibility when show/hide button is clicked", () => {
    const initialValues = {
      name: "",
      description: "",
      apiKey: "sk-test123",
      model: "gpt-4",
    };
    
    render(<AgentForm initialValues={initialValues} />);
    
    // API key should be hidden initially (password type)
    const apiKeyInput = screen.getByLabelText(/API Key/i) as HTMLInputElement;
    expect(apiKeyInput.type).toBe("password");
    
    // Click the show button
    fireEvent.click(screen.getByText("Show"));
    expect(apiKeyInput.type).toBe("text");
    
    // Click the hide button
    fireEvent.click(screen.getByText("Hide"));
    expect(apiKeyInput.type).toBe("password");
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
    
    // Check form sections
    const formSections = form?.querySelectorAll('.space-y-2');
    expect(formSections?.length).toBeGreaterThanOrEqual(3); // At least 3 form sections
    
    // Check button styling
    const button = screen.getByText('Save Configuration').closest('button');
    expect(button).toHaveClass('border-black');
    expect(button).toHaveClass('bg-black');
    expect(button).toHaveClass('text-white');
  });

  it("has proper labels for required fields", () => {
    render(<AgentForm />);
    
    // Check required field labels have asterisks
    expect(screen.getByText('Agent Name *')).toBeInTheDocument();
    expect(screen.getByText('API Key *')).toBeInTheDocument();
    expect(screen.getByText('Model *')).toBeInTheDocument();
    
    // Description is optional, so no asterisk
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.queryByText('Description *')).not.toBeInTheDocument();
  });

  it("displays security information about API key storage", () => {
    render(<AgentForm />);
    
    // Check for security information text
    expect(screen.getByText('Your API key is encrypted before being stored. We never store your API key in plain text.')).toBeInTheDocument();
    expect(screen.getByText('Your API key will be encrypted and stored securely.')).toBeInTheDocument();
  });

  it("renders all model options correctly", () => {
    render(<AgentForm />);
    
    // Get the model select element
    const modelSelect = screen.getByLabelText(/Model/i) as HTMLSelectElement;
    
    // Check all options are present
    expect(modelSelect.options.length).toBe(6);
    expect(modelSelect.options[0].text).toBe('GPT-4');
    expect(modelSelect.options[1].text).toBe('GPT-4 Turbo');
    expect(modelSelect.options[2].text).toBe('GPT-3.5 Turbo');
    expect(modelSelect.options[3].text).toBe('Claude 3 Opus');
    expect(modelSelect.options[4].text).toBe('Claude 3 Sonnet');
    expect(modelSelect.options[5].text).toBe('Claude 3 Haiku');
    
    // Check values
    expect(modelSelect.options[0].value).toBe('gpt-4');
    expect(modelSelect.options[3].value).toBe('claude-3-opus');
  });

  it("has default selection of GPT-4 model", () => {
    render(<AgentForm />);
    
    // Get the model select element
    const modelSelect = screen.getByLabelText(/Model/i) as HTMLSelectElement;
    
    // Check default selection
    expect(modelSelect.value).toBe('gpt-4');
  });
}); 