'use client';

import { sendMessage } from '@/lib/actions';
import { useState, FormEvent, useRef } from 'react';
import { nanoid } from 'nanoid';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
}

/**
 * Hook for managing chat state and interactions with an agent
 * @param agentId - The ID of the agent to chat with
 * @returns Chat state and functions for interacting with the agent
 */
export default function useChat(agentId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission to send a message to the agent
   * @param e - Form event
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Don't send empty messages
    if (!input.trim()) {
      return;
    }

    // Clear any previous errors
    setError(null);

    // Create a new user message
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: input,
    };

    // Add the user message to the chat
    setMessages((messages) => [...messages, userMessage]);
    
    // Clear the input
    setInput('');
    
    // Set loading state to true before sending the message
    setIsLoading(true);

    try {
      // Send the message to the agent
      const response = await sendMessage(agentId, userMessage.content);
      
      // Check for errors
      if ('error' in response) {
        const errorMessage = response.error;
        console.error('Error from AI service:', errorMessage);
        
        // Add an error message to the chat
        setMessages((messages) => [
          ...messages,
          {
            id: nanoid(),
            role: 'error',
            content: `Error: ${errorMessage}`,
          },
        ]);
        
        // Set the error state
        setError(errorMessage);
        return;
      }
      
      // Add the assistant's response to the chat
      setMessages((messages) => [
        ...messages,
        {
          id: response.id,
          role: response.role as 'assistant',
          content: response.content,
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add an error message to the chat
      setMessages((messages) => [
        ...messages,
        {
          id: nanoid(),
          role: 'error',
          content: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
        },
      ]);
      
      // Set the error state
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      // Set loading state to false after the message is sent
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
  };
} 