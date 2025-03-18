import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import useChat from '@/hooks/use-chat';
import { sendMessage } from '@/lib/actions';

// Mock the sendMessage function
vi.mock('@/lib/actions', () => ({
  sendMessage: vi.fn(),
}));

describe('useChat Hook', () => {
  const mockAgentId = 'agent-123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendMessage).mockResolvedValue({
      id: '123',
      role: 'assistant',
      content: 'This is a response',
    });
  });

  it('initializes with empty messages and input', () => {
    const { result } = renderHook(() => useChat(mockAgentId));
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.input).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('updates input when setInput is called', () => {
    const { result } = renderHook(() => useChat(mockAgentId));
    
    act(() => {
      result.current.setInput('Hello, world!');
    });
    
    expect(result.current.input).toBe('Hello, world!');
  });

  it('adds user message and calls sendMessage when handleSubmit is called', async () => {
    const { result } = renderHook(() => useChat(mockAgentId));
    
    // Set input
    act(() => {
      result.current.setInput('Hello, world!');
    });
    
    // Submit the message
    await act(async () => {
      await result.current.handleSubmit(new Event('submit') as any);
    });
    
    // Check if user message was added
    expect(result.current.messages[0]).toEqual({
      id: expect.any(String),
      role: 'user',
      content: 'Hello, world!',
    });
    
    // Check if sendMessage was called with correct arguments
    expect(sendMessage).toHaveBeenCalledWith(mockAgentId, 'Hello, world!');
    
    // Check if input was cleared
    expect(result.current.input).toBe('');
  });

  it('adds assistant message when sendMessage resolves', async () => {
    const { result } = renderHook(() => useChat(mockAgentId));
    
    // Set input
    act(() => {
      result.current.setInput('Hello, world!');
    });
    
    // Submit the message
    await act(async () => {
      await result.current.handleSubmit(new Event('submit') as any);
    });
    
    // Check if assistant message was added
    expect(result.current.messages[1]).toEqual({
      id: '123',
      role: 'assistant',
      content: 'This is a response',
    });
  });

  it('sets isLoading to true while sending message', async () => {
    // Create a promise we can control
    let resolvePromise: (value: any) => void;
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    // Mock sendMessage to use our controlled promise
    vi.mocked(sendMessage).mockImplementation(() => {
      return controlledPromise as Promise<any>;
    });
    
    const { result } = renderHook(() => useChat(mockAgentId));
    
    // Set input
    act(() => {
      result.current.setInput('Hello, world!');
    });
    
    // Start the submission but don't await it yet
    let submitPromise: Promise<void>;
    act(() => {
      submitPromise = result.current.handleSubmit(new Event('submit') as any);
    });
    
    // Now the loading state should be updated
    // We need to wait for React to process the state update
    await act(async () => {
      // Small delay to allow React to process state updates
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check if isLoading is true during the operation
    expect(result.current.isLoading).toBe(true);
    
    // Resolve the sendMessage promise
    await act(async () => {
      resolvePromise!({
        id: '123',
        role: 'assistant',
        content: 'This is a response',
      });
      await submitPromise;
    });
    
    // Verify isLoading is false after the operation completes
    expect(result.current.isLoading).toBe(false);
  });

  it('does not submit empty messages', async () => {
    const { result } = renderHook(() => useChat(mockAgentId));
    
    // Submit an empty message directly
    await act(async () => {
      await result.current.handleSubmit(new Event('submit') as any);
    });
    
    // Check that no messages were added
    expect(result.current.messages).toEqual([]);
    
    // Check that sendMessage was not called
    expect(sendMessage).not.toHaveBeenCalled();
  });
}); 