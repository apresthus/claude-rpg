import React, { useState, useEffect } from 'react';
import { Location } from '../types/game';
import { Modal } from './Modal';

interface LocationEditorProps {
  location?: Location;
  isOpen: boolean;
  onSave: (location: Partial<Location>) => void;
  onCancel: () => void;
  onGenerate: (field: string, name: string, existingData: Partial<Location>) => void;
  onGenerateImage: (name: string, description: string) => void;
  isLoading?: boolean;
}

export const LocationEditor: React.FC<LocationEditorProps> = ({
  location,
  isOpen,
  onSave,
  onCancel,
  onGenerate,
  onGenerateImage,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    type: '',
    district: '',
    description: '',
    atmosphere: '',
    notableFeatures: '',
    npcsPresent: '',
  });

  useEffect(() => {
    if (location) {
      setFormData(location);
    } else {
      setFormData({
        name: '',
        type: '',
        district: '',
        description: '',
        atmosphere: '',
        notableFeatures: '',
        npcsPresent: '',
      });
    }
  }, [location, isOpen]);

  const handleChange = (field: keyof Location, value: string) => {
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
    onGenerateImage(formData.name, formData.description || '');
  };

  const renderField = (
    label: string,
    field: keyof Location,
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
    <Modal isOpen={isOpen} onClose={onCancel} title={location ? 'Edit Location' : 'New Location'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {renderField('Name', 'name', 'Location name', false)}
            {renderField('Type', 'type', 'Tavern, Shop, Temple...', true)}
            {renderField('District', 'district', 'Market District, Old Town...', true)}
            {renderField('Description', 'description', 'General overview...', true, true)}
            {renderField('Atmosphere', 'atmosphere', 'Mood and ambiance...', true, true)}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Image Preview */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Location Image
              </label>
              <div className="glass rounded-lg p-4 space-y-3">
                {formData.imageUrl ? (
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-900/50">
                    <img
                      src={formData.imageUrl}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-600/30">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-lg bg-cyan-600/20 border-2 border-cyan-500/30 flex items-center justify-center mx-auto mb-2">
                        <svg
                          className="w-10 h-10 text-cyan-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
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

            {renderField('Notable Features', 'notableFeatures', 'Unique elements...', true, true)}
            {renderField('NPCs Present', 'npcsPresent', 'Characters found here...', true, true)}
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
            {isLoading ? 'Saving...' : 'Save Location'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
