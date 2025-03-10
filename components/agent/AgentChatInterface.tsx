"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import ChatMessage from './ChatMessage';
import ThemeCard from '../ui/ThemeCard';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface AgentChatInterfaceProps {
  agentId: string;
  messages: Message[];
  isLoading?: boolean;
  error?: string;
  onSendMessage: (message: string) => void;
}

export default function AgentChatInterface({
  agentId,
  messages,
  isLoading = false,
  error,
  onSendMessage,
}: AgentChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && messagesEndRef.current.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ThemeCard className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4" data-testid="message-list">
          {messages.length === 0 ? (
            <div className="text-center text-stone-400 py-8">
              No messages yet. Start a conversation with your agent.
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} showTimestamp />
            ))
          )}
          {isLoading && (
            <div className="flex justify-center py-4" data-testid="loading-indicator">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          )}
          {error && (
            <div className="text-red-500 p-2 rounded bg-red-100 bg-opacity-10 my-2" data-testid="error-message">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-stone-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="message-input"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="h-10 text-sm px-3 py-2"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </ThemeCard>
    </div>
  );
} 