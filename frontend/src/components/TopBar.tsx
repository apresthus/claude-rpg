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
          <h1 className="text-2xl font-bold text-gradient">
            {campaignName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-accent-gold to-accent-emerald hover:from-accent-gold/90 hover:to-accent-emerald/90 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl animate-sparkle"
          >
            ✨ New Campaign
          </button>
          <button className="w-10 h-10 rounded-xl glass-elevated flex items-center justify-center hover:bg-bg-elevated transition-all">
            ⚙️
          </button>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-primary-start via-accent-cyan to-primary-end" />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-elevated rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-gradient mb-6">
              Start New Campaign
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) =>
                    setFormData({ ...formData, campaignName: e.target.value })
                  }
                  className="w-full bg-bg-elevated border-2 border-primary-start/30 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary-start focus:ring-4 focus:ring-primary-start/20 transition-all"
                  placeholder="Epic Quest of Legend"
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
                  className="w-full bg-bg-elevated border-2 border-primary-start/30 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary-start focus:ring-4 focus:ring-primary-start/20 transition-all"
                  placeholder="Aldric"
                  required
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Class
                </label>
                <input
                  type="text"
                  value={formData.playerClass}
                  onChange={(e) =>
                    setFormData({ ...formData, playerClass: e.target.value })
                  }
                  className="w-full bg-bg-elevated border-2 border-primary-start/30 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary-start focus:ring-4 focus:ring-primary-start/20 transition-all"
                  placeholder="Ranger"
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
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-start to-primary-end hover:from-primary-start/90 hover:to-primary-end/90 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Begin Adventure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
