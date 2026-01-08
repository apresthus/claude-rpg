import React, { useState } from 'react';
import { PlayerState } from '../types/game';
import { InventoryView } from './InventoryView';
import { QuestLog } from './QuestLog';

interface SidePanelProps {
  playerState: PlayerState;
}

type Tab = 'inventory' | 'quests' | 'character';

export const SidePanel: React.FC<SidePanelProps> = ({ playerState }) => {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'inventory', label: 'Inventory', icon: '🎒' },
    { id: 'quests', label: 'Quests', icon: '📋' },
    { id: 'character', label: 'Character', icon: '👤' },
  ];

  return (
    <div className="glass rounded-2xl h-full flex flex-col overflow-hidden shadow-2xl">
      <div className="flex border-b border-primary-start/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-4 font-semibold transition-all ${
              activeTab === tab.id
                ? 'text-text-primary bg-gradient-to-b from-primary-start/20 to-transparent border-b-2 border-primary-start'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'inventory' && (
          <InventoryView items={playerState.inventory} />
        )}
        {activeTab === 'quests' && <QuestLog quests={playerState.quests} />}
        {activeTab === 'character' && (
          <div className="p-6 space-y-6">
            <div className="glass-elevated rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">⚔️</div>
              <h2 className="text-2xl font-bold text-gradient mb-2">
                {playerState.name || 'Adventurer'}
              </h2>
              <p className="text-accent-gold text-lg">
                {playerState.class || 'Wanderer'}
              </p>
            </div>

            {playerState.stats && Object.keys(playerState.stats).length > 0 && (
              <div className="glass-elevated rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-text-primary">
                  Stats
                </h3>
                <div className="space-y-3">
                  {Object.entries(playerState.stats).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between items-center">
                      <span className="text-text-secondary capitalize">{stat}</span>
                      <span className="text-text-primary font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {playerState.notes.length > 0 && (
              <div className="glass-elevated rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-text-primary">
                  Notes
                </h3>
                <div className="space-y-2">
                  {playerState.notes.map((note, index) => (
                    <div
                      key={index}
                      className="text-sm text-text-secondary bg-bg-dark/50 rounded-lg p-3"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
