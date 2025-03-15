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
    // Mock sendMessage to delay response
    vi.mocked(sendMessage).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: '123',
            role: 'assistant',
            content: 'This is a response',
          });
        }, 100);
      });
    });
    
    const { result } = renderHook(() => useChat(mockAgentId));
    
    // Set input
    act(() => {
      result.current.setInput('Hello, world!');
    });
    
    // Start submitting the message
    const submitPromise = act(async () => {
      await result.current.handleSubmit(new Event('submit') as any);
    });
    
    // Check if isLoading is true during the request
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the request to complete
    await submitPromise;
    
    // Check if isLoading is false after the request
    expect(result.current.isLoading).toBe(false);
  });

  it('does not submit empty messages', async () => {
    const { result } = renderHook(() => useChat(mockAgentId));
    
    // Set empty input
    act(() => {
      result.current.setInput('');
    });
    
    // Try to submit the empty message
    await act(async () => {
      await result.current.handleSubmit(new Event('submit') as any);
    });
    
    // Check that no messages were added
    expect(result.current.messages).toEqual([]);
    
    // Check that sendMessage was not called
    expect(sendMessage).not.toHaveBeenCalled();
  });
}); 