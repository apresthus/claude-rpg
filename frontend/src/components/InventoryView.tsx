import React from 'react';
import { Item } from '../types/game';

interface InventoryViewProps {
  items: Item[];
}

const getItemInitials = (item: Item): string => {
  if (item.icon) return item.icon;

  const words = item.name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return item.name.substring(0, 2).toUpperCase();
};

export const InventoryView: React.FC<InventoryViewProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-bg-elevated border-2 border-dashed border-text-secondary/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-text-secondary/50">—</span>
          </div>
          <p className="text-sm">No items yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="glass-elevated rounded-xl p-4 hover:border-accent-cyan hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-emerald/20 border border-accent-cyan/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-sm font-bold text-accent-cyan">
              {getItemInitials(item)}
            </span>
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
