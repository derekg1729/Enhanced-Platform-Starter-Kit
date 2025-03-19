import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentDetails from '@/components/agent-details';

// Mock agent with all fields including temperature and instructions
const mockAgent = {
  id: 'test-agent',
  name: 'Test Agent',
  description: 'A test agent',
  userId: 'user123',
  model: 'gpt-4',
  temperature: 0.7,
  instructions: 'You are a test agent for unit testing',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AgentDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the collapsed state by default', () => {
    render(<AgentDetails agent={mockAgent} />);
    
    expect(screen.getByText('Agent Configuration')).toBeInTheDocument();
    expect(screen.queryByText('Temperature')).not.toBeInTheDocument(); // Not visible when collapsed
  });
  
  it('expands to show details when clicked', () => {
    render(<AgentDetails agent={mockAgent} />);
    
    // Initially collapsed
    expect(screen.queryByText('Temperature')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(screen.getByText('Agent Configuration'));
    
    // Now expanded
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Model')).toBeInTheDocument();
    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });
  
  it('displays temperature information correctly', () => {
    render(<AgentDetails agent={mockAgent} />);
    
    // Click to expand
    fireEvent.click(screen.getByText('Agent Configuration'));
    
    // Check temperature value is displayed
    expect(screen.getByText('0.7')).toBeInTheDocument();
  });
  
  it('shows correct model display name', () => {
    render(<AgentDetails agent={mockAgent} />);
    
    // Click to expand
    fireEvent.click(screen.getByText('Agent Configuration'));
    
    // Check model name
    expect(screen.getByText('GPT-4')).toBeInTheDocument();
  });
  
  it('displays instructions when available', () => {
    render(<AgentDetails agent={mockAgent} />);
    
    // Click to expand
    fireEvent.click(screen.getByText('Agent Configuration'));
    
    // Check instructions are shown
    expect(screen.getByText('You are a test agent for unit testing')).toBeInTheDocument();
  });
  
  it('uses default temperature value when not provided', () => {
    const agentWithoutTemp = {
      ...mockAgent,
      temperature: undefined,
    };
    
    render(<AgentDetails agent={agentWithoutTemp} />);
    
    // Click to expand
    fireEvent.click(screen.getByText('Agent Configuration'));
    
    // Should display default value
    expect(screen.getByText('0.7')).toBeInTheDocument();
  });
  
  it('hides instructions section when not provided', () => {
    const agentWithoutInstructions = {
      ...mockAgent,
      instructions: undefined,
    };
    
    render(<AgentDetails agent={agentWithoutInstructions} />);
    
    // Click to expand
    fireEvent.click(screen.getByText('Agent Configuration'));
    
    // Temperature and model should be visible
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Model')).toBeInTheDocument();
    
    // Instructions should not be visible
    expect(screen.queryByText('Instructions')).not.toBeInTheDocument();
  });
  
  it('collapses details when clicked again', () => {
    render(<AgentDetails agent={mockAgent} />);
    
    // Initially collapsed
    expect(screen.queryByText('Temperature')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(screen.getByText('Agent Configuration'));
    
    // Now expanded
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(screen.getByText('Agent Configuration'));
    
    // Should be collapsed again
    expect(screen.queryByText('Temperature')).not.toBeInTheDocument();
  });
}); 