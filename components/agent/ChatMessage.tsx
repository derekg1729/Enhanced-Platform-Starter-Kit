"use client";

import React from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
  };
  showTimestamp?: boolean;
}

export default function ChatMessage({ message, showTimestamp = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const formattedTime = format(new Date(message.timestamp), 'h:mm a');
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      data-testid={`${message.role}-message`}
    >
      <div 
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-stone-800 text-white border border-stone-700'
        }`}
      >
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <div className="my-2" data-testid="code-block">
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {showTimestamp && (
          <div className="text-xs text-stone-400 mt-1 text-right">
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
} 