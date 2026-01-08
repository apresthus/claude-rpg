import React, { useState, useEffect } from 'react';
import { RoleplayInfo } from '../types/game';
import { Modal } from './Modal';

interface RoleplayPickerProps {
  isOpen: boolean;
  currentRoleplay: RoleplayInfo | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  getRoleplays: () => Promise<RoleplayInfo[]>;
}

export const RoleplayPicker: React.FC<RoleplayPickerProps> = ({
  isOpen,
  currentRoleplay,
  onClose,
  onSelect,
  onDelete,
  onCreateNew,
  getRoleplays,
}) => {
  const [roleplays, setRoleplays] = useState<RoleplayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getRoleplays().then((data) => {
        setRoleplays(data);
        setIsLoading(false);
      });
    }
  }, [isOpen, getRoleplays]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this roleplay? This cannot be undone.')) {
      onDelete(id);
      setRoleplays((prev) => prev.filter((rp) => rp.id !== id));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your Roleplays">
      <div className="space-y-4">
        {/* Create new button */}
        <button
          onClick={onCreateNew}
          className="w-full py-3 border-2 border-dashed border-accent-cyan/30 rounded-xl text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/50 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Roleplay
        </button>

        {/* Roleplays list */}
        {isLoading ? (
          <div className="text-center py-8 text-text-secondary">Loading...</div>
        ) : roleplays.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No roleplays yet. Create your first one!
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {roleplays.map((rp) => (
              <div
                key={rp.id}
                onClick={() => {
                  if (rp.id !== currentRoleplay?.id) {
                    onSelect(rp.id);
                    onClose();
                  }
                }}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  rp.id === currentRoleplay?.id
                    ? 'bg-accent-cyan/20 border-2 border-accent-cyan/50'
                    : 'glass-elevated hover:bg-bg-elevated/70 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary truncate">
                        {rp.name || 'Untitled'}
                      </h3>
                      {rp.id === currentRoleplay?.id && (
                        <span className="text-xs bg-accent-cyan/30 text-accent-cyan px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {rp.playerName || 'Player'} - {rp.playerRole || 'Participant'}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Last played: {formatDate(rp.lastPlayed)}
                    </p>
                  </div>
                  {rp.id !== currentRoleplay?.id && (
                    <button
                      onClick={(e) => handleDelete(e, rp.id)}
                      className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                      title="Delete roleplay"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
