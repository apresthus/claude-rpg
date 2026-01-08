import React, { useState } from 'react';

interface TopBarProps {
  campaignName: string;
  onNewCampaign: (name: string, playerName: string, playerClass: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ campaignName, onNewCampaign }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: '',
    playerName: '',
    playerClass: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.campaignName && formData.playerName && formData.playerClass) {
      onNewCampaign(formData.campaignName, formData.playerName, formData.playerClass);
      setShowModal(false);
      setFormData({ campaignName: '', playerName: '', playerClass: '' });
    }
  };

  return (
    <>
      <div className="glass-elevated px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-text-primary">
            {campaignName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 rounded-xl font-semibold text-bg-dark bg-gradient-to-r from-accent-cyan to-accent-emerald hover:from-accent-cyan/90 hover:to-accent-emerald/90 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            New Session
          </button>
          <button className="w-10 h-10 rounded-xl glass-elevated flex items-center justify-center hover:bg-bg-elevated transition-all">
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-accent-cyan via-accent-emerald to-accent-cyan" />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-elevated rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Start New Session
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) =>
                    setFormData({ ...formData, campaignName: e.target.value })
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
                  value={formData.playerClass}
                  onChange={(e) =>
                    setFormData({ ...formData, playerClass: e.target.value })
                  }
                  className="w-full bg-bg-elevated border-2 border-accent-cyan/30 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/20 transition-all"
                  placeholder="Investigator"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-text-secondary bg-bg-elevated hover:bg-bg-card transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-bg-dark bg-gradient-to-r from-accent-cyan to-accent-emerald hover:from-accent-cyan/90 hover:to-accent-emerald/90 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Start
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
