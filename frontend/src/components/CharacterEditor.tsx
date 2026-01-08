import React, { useState, useEffect } from 'react';
import { Character } from '../types/game';
import { Modal } from './Modal';

interface CharacterEditorProps {
  character?: Character;
  isOpen: boolean;
  onSave: (character: Partial<Character>) => void;
  onCancel: () => void;
  onGenerate: (field: string, name: string, existingData: Partial<Character>) => void;
  onGenerateImage: (name: string, appearance: string) => void;
  isLoading?: boolean;
}

export const CharacterEditor: React.FC<CharacterEditorProps> = ({
  character,
  isOpen,
  onSave,
  onCancel,
  onGenerate,
  onGenerateImage,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Character>>({
    name: '',
    role: '',
    appearance: '',
    background: '',
    motivations: '',
    personality: '',
    knows: '',
    doesntKnow: '',
  });

  useEffect(() => {
    if (character) {
      setFormData(character);
    } else {
      setFormData({
        name: '',
        role: '',
        appearance: '',
        background: '',
        motivations: '',
        personality: '',
        knows: '',
        doesntKnow: '',
      });
    }
  }, [character, isOpen]);

  const handleChange = (field: keyof Character, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    onSave(formData);
  };

  const handleGenerateField = (field: string) => {
    if (!formData.name?.trim()) return;
    onGenerate(field, formData.name, formData);
  };

  const handleGenerateImage = () => {
    if (!formData.name?.trim()) return;
    onGenerateImage(formData.name, formData.appearance || '');
  };

  const renderField = (
    label: string,
    field: keyof Character,
    placeholder: string,
    canGenerate: boolean = true,
    multiline: boolean = false
  ) => {
    const InputComponent = multiline ? 'textarea' : 'input';
    const inputClasses = `w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 ${
      multiline ? 'resize-none' : ''
    }`;

    return (
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          {label}
        </label>
        <div className="flex gap-2">
          <InputComponent
            className={inputClasses}
            placeholder={placeholder}
            value={(formData[field] as string) || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            rows={multiline ? 3 : undefined}
          />
          {canGenerate && (
            <button
              type="button"
              onClick={() => handleGenerateField(field)}
              disabled={isLoading || !formData.name?.trim()}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-all duration-200 whitespace-nowrap shadow-lg hover:shadow-cyan-500/30"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={character ? 'Edit Character' : 'New Character'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {renderField('Name', 'name', 'Character name', false)}
            {renderField('Role', 'role', 'Merchant, Guard, Scholar...', true)}
            {renderField('Appearance', 'appearance', 'Physical description...', true, true)}
            {renderField('Background', 'background', 'History and origin...', true, true)}
            {renderField('Motivations', 'motivations', 'Goals and desires...', true, true)}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Image Preview */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Character Image
              </label>
              <div className="glass rounded-lg p-4 space-y-3">
                {formData.imageUrl ? (
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-900/50">
                    <img
                      src={formData.imageUrl}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-600/30">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-cyan-600/20 border-2 border-cyan-500/30 flex items-center justify-center mx-auto mb-2">
                        <span className="text-4xl font-bold text-cyan-400">
                          {formData.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">No image generated</p>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={isLoading || !formData.name?.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-emerald-500/30"
                >
                  Generate Image
                </button>
              </div>
            </div>

            {renderField('Personality', 'personality', 'Traits and mannerisms...', true, true)}
            {renderField('Knows', 'knows', 'Information they possess...', true, true)}
            {renderField('Doesn\'t Know', 'doesntKnow', 'Information they lack...', true, true)}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-600/30">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 glass hover:glass-elevated rounded-lg text-slate-300 font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.name?.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/30"
          >
            {isLoading ? 'Saving...' : 'Save Character'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
