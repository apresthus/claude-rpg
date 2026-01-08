import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types/game';
import { Modal } from './Modal';

interface PlayerProfileEditorProps {
  player: PlayerState;
  isOpen: boolean;
  onSave: (profile: Partial<PlayerState>) => void;
  onCancel: () => void;
  onGenerateImage: () => void;
  isLoading?: boolean;
}

export const PlayerProfileEditor: React.FC<PlayerProfileEditorProps> = ({
  player,
  isOpen,
  onSave,
  onCancel,
  onGenerateImage,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    appearance: '',
    background: '',
    personality: '',
    goals: '',
  });

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name || '',
        role: player.role || player.class || '',
        appearance: player.appearance || '',
        background: player.background || '',
        personality: player.personality || '',
        goals: player.goals || '',
      });
    }
  }, [player, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({
      name: formData.name,
      role: formData.role,
      class: formData.role,
      appearance: formData.appearance,
      background: formData.background,
      personality: formData.personality,
      goals: formData.goals,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Edit Profile">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        {/* Image Section */}
        <div className="flex items-center gap-4 p-4 glass-elevated rounded-xl">
          {player.imageUrl ? (
            <img
              src={player.imageUrl}
              alt={player.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-accent-cyan/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-cyan to-accent-emerald flex items-center justify-center">
              <span className="text-2xl font-bold text-bg-dark">
                {(formData.name || 'P').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={onGenerateImage}
            disabled={isLoading || !formData.appearance}
            className="px-4 py-2 bg-gradient-to-r from-accent-emerald to-accent-cyan text-bg-dark font-semibold rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-bg-dark/50 border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-cyan"
              placeholder="Character name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Role
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 bg-bg-dark/50 border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-cyan"
              placeholder="e.g., Detective, Student, Artist"
            />
          </div>
        </div>

        {/* Appearance */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Appearance
          </label>
          <textarea
            value={formData.appearance}
            onChange={(e) => handleChange('appearance', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-bg-dark/50 border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-cyan resize-none"
            placeholder="Describe your character's physical appearance..."
          />
        </div>

        {/* Background */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Background
          </label>
          <textarea
            value={formData.background}
            onChange={(e) => handleChange('background', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-bg-dark/50 border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-cyan resize-none"
            placeholder="Your character's history and backstory..."
          />
        </div>

        {/* Personality */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Personality
          </label>
          <textarea
            value={formData.personality}
            onChange={(e) => handleChange('personality', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-bg-dark/50 border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-cyan resize-none"
            placeholder="Key personality traits..."
          />
        </div>

        {/* Goals */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Goals
          </label>
          <textarea
            value={formData.goals}
            onChange={(e) => handleChange('goals', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-bg-dark/50 border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-cyan resize-none"
            placeholder="What does your character want to achieve?"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-subtle">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || !formData.name.trim()}
          className="px-6 py-2 bg-gradient-to-r from-accent-cyan to-accent-emerald text-bg-dark font-semibold rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};
