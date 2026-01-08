import React from 'react';
import { Quest } from '../types/game';

interface QuestLogProps {
  quests: Quest[];
}

export const QuestLog: React.FC<QuestLogProps> = ({ quests }) => {
  if (quests.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <div className="text-center">
          <div className="text-5xl mb-3">📋</div>
          <p>No active quests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {quests.map((quest) => (
        <div
          key={quest.id}
          className={`glass-elevated rounded-xl p-4 transition-all ${
            quest.completed
              ? 'opacity-60 border-accent-emerald'
              : 'border-accent-gold hover:shadow-lg'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                quest.completed
                  ? 'bg-accent-emerald border-accent-emerald'
                  : 'border-accent-gold hover:bg-accent-gold/10'
              }`}
            >
              {quest.completed && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`font-medium ${
                  quest.completed
                    ? 'line-through text-text-secondary'
                    : 'text-text-primary'
                }`}
              >
                {quest.title}
              </h3>
            </div>
            <div className="text-2xl flex-shrink-0">
              {quest.completed ? '✅' : '⏳'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
