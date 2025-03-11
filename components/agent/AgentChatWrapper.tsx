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
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

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
      
      // Create a placeholder for the assistant's response
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Call the API with streaming
      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          conversationId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      // Check if the response is a stream
      if (!response.body) {
        throw new Error('Response body is empty');
      }
      
      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and append to the content
        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;
        
        // Update the message with the streamed content so far
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: streamedContent } 
              : msg
          )
        );
      }
      
      // If this is the first message, store the conversation ID for future messages
      if (!conversationId && response.headers.get('X-Conversation-Id')) {
        setConversationId(response.headers.get('X-Conversation-Id') || undefined);
      }
      
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
      
      // Remove the empty assistant message if there was an error
      setMessages(prev => prev.filter(msg => msg.content !== ''));
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