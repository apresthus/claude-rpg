import React, { useState, KeyboardEvent } from 'react';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSend, disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-elevated rounded-2xl p-4 shadow-2xl">
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your message..."
            className="w-full bg-bg-elevated border-2 border-accent-cyan/30 rounded-xl px-6 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-8 py-3 rounded-xl font-semibold text-bg-dark bg-gradient-to-r from-accent-cyan to-accent-emerald hover:from-accent-cyan/90 hover:to-accent-emerald/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:transform-none"
        >
          Send
        </button>
      </div>
    </div>
  );
};
