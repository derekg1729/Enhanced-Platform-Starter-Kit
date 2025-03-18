'use client';

import { useState } from 'react';
import { SelectAgent } from '@/lib/schema';
import useChat from '@/hooks/use-chat';
import { SendIcon, Loader2, AlertCircle, Save } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { updateAgent } from '@/lib/actions';
import { toast } from 'sonner';

// Map model IDs to display names
const MODEL_OPTIONS = [
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "claude-3-opus", name: "Claude 3 Opus" },
  { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku" },
];

interface ChatInterfaceProps {
  agent: SelectAgent;
}

export default function ChatInterface({ agent }: ChatInterfaceProps) {
  const [currentModel, setCurrentModel] = useState(agent.model);
  const [isUpdating, setIsUpdating] = useState(false);
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

  // Handle model change
  const handleModelChange = async () => {
    if (currentModel === agent.model) return;
    
    setIsUpdating(true);
    try {
      const result = await updateAgent({
        id: agent.id,
        name: agent.name,
        description: agent.description || '',
        model: currentModel,
      });
      
      if (result.error) {
        toast.error(`Failed to update model: ${result.error}`);
        setCurrentModel(agent.model); // Reset to original model if failed
      } else {
        toast.success('Agent model updated successfully');
        // Force a page refresh to apply the model change
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update model');
      setCurrentModel(agent.model); // Reset to original model if failed
    } finally {
      setIsUpdating(false);
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
          <div className="flex items-center mt-1 space-x-2">
            <select
              value={currentModel}
              onChange={(e) => setCurrentModel(e.target.value)}
              className="text-sm bg-transparent border border-stone-200 rounded px-2 py-1 dark:border-stone-700 dark:text-stone-400"
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            {currentModel !== agent.model && (
              <button
                onClick={handleModelChange}
                disabled={isUpdating}
                className="inline-flex items-center text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}
                Save
              </button>
            )}
          </div>
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