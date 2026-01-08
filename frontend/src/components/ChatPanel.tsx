import React, { useEffect, useRef } from 'react';
import { Message } from '../types/game';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-text-secondary max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-emerald/20 border-2 border-accent-cyan/30 flex items-center justify-center animate-float">
                <svg className="w-12 h-12 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-3">
                Begin Your Story
              </h2>
              <p className="text-base text-text-secondary">
                Type your first message to start the narrative...
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                enableTypewriter={index === messages.length - 1 && message.type === 'gm'}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="glass rounded-2xl px-6 py-4 flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-text-secondary text-sm">Generating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-6 pt-0">
        <InputBar onSend={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};
