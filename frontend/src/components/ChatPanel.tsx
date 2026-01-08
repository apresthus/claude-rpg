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
            <div className="text-center text-text-secondary">
              <div className="text-6xl mb-4 animate-float">🎲</div>
              <h2 className="text-2xl font-bold text-gradient mb-2">
                Begin Your Adventure
              </h2>
              <p className="text-lg">
                Type your first action to start the story...
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
                    <div className="w-2 h-2 rounded-full bg-primary-start animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary-start animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary-start animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-text-secondary text-sm">GM is thinking...</span>
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
