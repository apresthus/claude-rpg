import React from 'react';
import { Quest } from '../types/game';

interface QuestLogProps {
  quests: Quest[];
}

export const QuestLog: React.FC<QuestLogProps> = ({ quests }) => {
  if (quests.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-bg-elevated border-2 border-dashed border-text-secondary/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-text-secondary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm">No active objectives</p>
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
              : 'border-accent-cyan hover:shadow-lg'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                quest.completed
                  ? 'bg-accent-emerald border-accent-emerald'
                  : 'border-accent-cyan hover:bg-accent-cyan/10'
              }`}
            >
              {quest.completed && (
                <svg
                  className="w-4 h-4 text-bg-dark"
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
            <div className={`text-xs font-semibold px-2 py-1 rounded-md flex-shrink-0 ${
              quest.completed
                ? 'bg-accent-emerald/20 text-accent-emerald'
                : 'bg-accent-cyan/20 text-accent-cyan'
            }`}>
              {quest.completed ? 'Done' : 'Active'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
