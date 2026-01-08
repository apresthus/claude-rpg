import React, { useState } from 'react';
import { RoleplayInfo } from '../types/game';
import { RoleplayPicker } from './RoleplayPicker';

interface TopBarProps {
  currentRoleplay: RoleplayInfo | null;
  onNewRoleplay: (name: string, playerName: string, playerRole: string) => void;
  onSwitchRoleplay: (id: string) => void;
  onDeleteRoleplay: (id: string) => void;
  getRoleplays: () => Promise<RoleplayInfo[]>;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRoleplay,
  onNewRoleplay,
  onSwitchRoleplay,
  onDeleteRoleplay,
  getRoleplays,
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [formData, setFormData] = useState({
    roleplayName: '',
    playerName: '',
    playerRole: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.roleplayName && formData.playerName && formData.playerRole) {
      onNewRoleplay(formData.roleplayName, formData.playerName, formData.playerRole);
      setShowNewModal(false);
      setFormData({ roleplayName: '', playerName: '', playerRole: '' });
    }
  };

  const handleCreateNew = () => {
    setShowPicker(false);
    setShowNewModal(true);
  };

  return (
    <>
      <div className="glass-elevated px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-2 hover:bg-bg-elevated/50 rounded-lg px-3 py-1 -ml-3 transition-all"
            title="Switch roleplay"
          >
            <h1 className="text-2xl font-bold text-text-primary">
              {currentRoleplay?.name || 'New Roleplay'}
            </h1>
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-6 py-2 rounded-xl font-semibold text-bg-dark bg-gradient-to-r from-accent-cyan to-accent-emerald hover:from-accent-cyan/90 hover:to-accent-emerald/90 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            New Roleplay
          </button>
          <button
            onClick={() => setShowPicker(true)}
            className="w-10 h-10 rounded-xl glass-elevated flex items-center justify-center hover:bg-bg-elevated transition-all"
            title="Browse roleplays"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-accent-cyan via-accent-emerald to-accent-cyan" />

      {/* Roleplay Picker */}
      <RoleplayPicker
        isOpen={showPicker}
        currentRoleplay={currentRoleplay}
        onClose={() => setShowPicker(false)}
        onSelect={onSwitchRoleplay}
        onDelete={onDeleteRoleplay}
        onCreateNew={handleCreateNew}
        getRoleplays={getRoleplays}
      />

      {/* New Roleplay Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-elevated rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              New Roleplay
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Roleplay Name
                </label>
                <input
                  type="text"
                  value={formData.roleplayName}
                  onChange={(e) =>
                    setFormData({ ...formData, roleplayName: e.target.value })
                  }
                  className="w-full bg-bg-elevated border-2 border-accent-cyan/30 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/20 transition-all"
                  placeholder="My Story"
                  required
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Character Name
                </label>
                <input
                  type="text"
                  value={formData.playerName}
                  onChange={(e) =>
                    setFormData({ ...formData, playerName: e.target.value })
                  }
                  className="w-full bg-bg-elevated border-2 border-accent-cyan/30 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/20 transition-all"
                  placeholder="Alex"
                  required
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.playerRole}
                  onChange={(e) =>
                    setFormData({ ...formData, playerRole: e.target.value })
                  }
                  className="w-full bg-bg-elevated border-2 border-accent-cyan/30 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/20 transition-all"
                  placeholder="Investigator"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-text-secondary bg-bg-elevated hover:bg-bg-card transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-bg-dark bg-gradient-to-r from-accent-cyan to-accent-emerald hover:from-accent-cyan/90 hover:to-accent-emerald/90 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
