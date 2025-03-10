"use client";

import React, { useState } from 'react';
import AgentChatInterface, { Message } from './AgentChatInterface';

interface AgentChatWrapperProps {
  agentId: string;
  initialMessages: Message[];
}

export default function AgentChatWrapper({ 
  agentId, 
  initialMessages 
}: AgentChatWrapperProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSendMessage = async (message: string) => {
    try {
      // Add user message to the chat
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        role: 'user',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setError(undefined);
      
      // In a real implementation, this would call an API
      console.log(`Sending message to agent ${agentId}: ${message}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${message}". This is a placeholder response.`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AgentChatInterface
      agentId={agentId}
      messages={messages}
      isLoading={isLoading}
      error={error}
      onSendMessage={handleSendMessage}
    />
  );
} 