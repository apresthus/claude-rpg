import React from 'react';
import { Item } from '../types/game';

interface InventoryViewProps {
  items: Item[];
}

const defaultIcons: Record<string, string> = {
  sword: '⚔️',
  gold: '💰',
  potion: '🧪',
  key: '🗝️',
  letter: '📜',
  shield: '🛡️',
  bow: '🏹',
  staff: '🪄',
  ring: '💍',
  book: '📖',
};

const getItemIcon = (item: Item): string => {
  if (item.icon) return item.icon;

  const itemName = item.name.toLowerCase();
  for (const [key, icon] of Object.entries(defaultIcons)) {
    if (itemName.includes(key)) return icon;
  }

  return '📦';
};

export const InventoryView: React.FC<InventoryViewProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <div className="text-center">
          <div className="text-5xl mb-3">🎒</div>
          <p>Your inventory is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="glass-elevated rounded-xl p-4 hover:border-primary-start hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="text-4xl mb-2 text-center group-hover:scale-110 transition-transform">
            {getItemIcon(item)}
          </div>
          <div className="text-sm text-center text-text-primary font-medium truncate">
            {item.name}
          </div>
          {item.description && (
            <div className="text-xs text-text-secondary text-center mt-1 truncate">
              {item.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
