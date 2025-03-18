'use client';

import { SelectAgent } from '@/lib/schema';
import useChat from '@/hooks/use-chat';
import { SendIcon, Loader2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

interface ChatInterfaceProps {
  agent: SelectAgent;
}

export default function ChatInterface({ agent }: ChatInterfaceProps) {
  const { messages, input, setInput, handleSubmit, isLoading } = useChat(agent.id);

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
      {/* Agent info */}
      <div 
        data-testid="agent-info"
        className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700"
      >
        <div>
          <h2 className="text-xl font-bold dark:text-white">{agent.name}</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">{agent.model}</p>
        </div>
      </div>

      {/* Messages container */}
      <div 
        data-testid="messages-container"
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-stone-500 dark:text-stone-400">
              Send a message to start chatting with {agent.name}
            </p>
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
                    : 'mr-auto bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="mr-auto rounded-lg bg-stone-100 px-4 py-2 dark:bg-stone-800">
              <Loader2 className="h-5 w-5 animate-spin text-stone-500 dark:text-stone-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input container */}
      <div 
        data-testid="input-container"
        className="border-t border-stone-200 p-4 dark:border-stone-700"
      >
        <form onSubmit={handleSubmit} className="flex items-end space-x-2" data-testid="chat-form">
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