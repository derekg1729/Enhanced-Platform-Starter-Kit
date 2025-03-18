'use client';

import { useState } from 'react';
import { SelectAgent } from '@/lib/schema';
import useChat from '@/hooks/use-chat';
import { SendIcon, Loader2, AlertCircle } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  agent: SelectAgent;
}

export default function ChatInterface({ agent }: ChatInterfaceProps) {
  const { messages, input, setInput, handleSubmit, isLoading, error } = useChat(agent.id);

  // Handle the Enter key press to submit the form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages container - removed unnecessary padding-top */}
      <div 
        data-testid="messages-container"
        className="flex-1 overflow-y-auto pb-4 px-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            {/* Empty state - intentionally left blank for a cleaner interface */}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
              data-testid={`message-${message.role}`}
            >
              <div
                className={`max-w-3/4 rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'ml-auto bg-blue-500 text-white'
                    : message.role === 'error'
                    ? 'mr-auto bg-red-100 text-red-700 flex items-center space-x-2'
                    : 'mr-auto bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-white'
                }`}
              >
                {message.role === 'error' && (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-stone-100 px-4 py-2 dark:bg-stone-700">
              <Loader2 className="h-4 w-4 animate-spin" role="status" />
            </div>
          </div>
        )}
        {error && !isLoading && messages.length > 0 && messages[messages.length - 1].role !== 'error' && (
          <div className="flex justify-start">
            <div className="mr-auto rounded-lg bg-red-100 px-4 py-2 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input container */}
      <div 
        data-testid="input-container"
        className="border-t border-stone-200 p-4 dark:border-stone-700"
      >
        <form onSubmit={handleSubmit} className="flex items-center space-x-2" data-testid="chat-form">
          <div className="relative flex-1">
            <TextareaAutosize
              data-testid="chat-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full rounded-lg border border-stone-200 p-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              minRows={1}
              maxRows={5}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
            data-testid="send-button"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
} 