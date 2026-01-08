import React, { useState, useEffect } from 'react';
import { Message } from '../types/game';

interface MessageBubbleProps {
  message: Message;
  enableTypewriter?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  enableTypewriter = false,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(enableTypewriter);

  useEffect(() => {
    if (!enableTypewriter || message.type === 'player') {
      setDisplayedText(message.content);
      setIsTyping(false);
      return;
    }

    let currentIndex = 0;
    const text = message.content;
    setDisplayedText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [message.content, enableTypewriter, message.type]);

  const isGM = message.type === 'gm';

  return (
    <div
      className={`flex ${isGM ? 'justify-start' : 'justify-end'} mb-4 animate-slide-in`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-6 py-4 ${
          isGM
            ? 'glass border-l-4 border-l-accent-cyan shadow-lg'
            : 'glass-elevated border-r-4 border-r-accent-emerald shadow-lg'
        }`}
      >
        <div className="flex items-start gap-3">
          {isGM && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-primary-end flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-bg-dark">GM</span>
            </div>
          )}
          <div className="flex-1">
            <div className="text-xs text-text-secondary mb-1 font-semibold tracking-wide">
              {isGM ? 'STORY' : 'YOU'}
            </div>
            <div className="text-text-primary leading-relaxed whitespace-pre-wrap">
              {displayedText}
              {isTyping && <span className="typewriter-cursor ml-1" />}
            </div>
          </div>
          {!isGM && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-emerald to-accent-cyan flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-bg-dark">YOU</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
