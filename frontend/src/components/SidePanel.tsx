import React, { useState } from 'react';
import { PlayerState, Character, Location } from '../types/game';
import { InventoryView } from './InventoryView';
import { QuestLog } from './QuestLog';
import { CharacterList } from './CharacterList';
import { CharacterEditor } from './CharacterEditor';
import { LocationList } from './LocationList';
import { LocationEditor } from './LocationEditor';

interface SidePanelProps {
  playerState: PlayerState;
  characters: Character[];
  locations: Location[];
  onAddCharacter: (character: Partial<Character>) => Promise<Character | null>;
  onUpdateCharacter: (id: string, character: Partial<Character>) => Promise<Character | null>;
  onDeleteCharacter: (id: string) => Promise<boolean>;
  onAddLocation: (location: Partial<Location>) => Promise<Location | null>;
  onUpdateLocation: (id: string, location: Partial<Location>) => Promise<Location | null>;
  onDeleteLocation: (id: string) => Promise<boolean>;
  onGenerateCharacterContent: (name: string, existing?: string) => Promise<any>;
  onGenerateLocationContent: (name: string, existing?: string) => Promise<any>;
  onGenerateImage: (prompt: string, category?: string, id?: string) => Promise<any>;
  isLoading?: boolean;
}

type Tab = 'inventory' | 'quests' | 'profile' | 'characters' | 'locations';

export const SidePanel: React.FC<SidePanelProps> = ({
  playerState,
  characters,
  locations,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  onGenerateCharacterContent,
  onGenerateLocationContent,
  onGenerateImage,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isCharacterEditorOpen, setIsCharacterEditorOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isLocationEditorOpen, setIsLocationEditorOpen] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'inventory', label: 'Items' },
    { id: 'quests', label: 'Quests' },
    { id: 'profile', label: 'Profile' },
    { id: 'characters', label: 'NPCs' },
    { id: 'locations', label: 'Places' },
  ];

  // Character handlers
  const handleAddCharacter = () => {
    setEditingCharacter(null);
    setIsCharacterEditorOpen(true);
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setIsCharacterEditorOpen(true);
  };

  const handleSaveCharacter = async (character: Partial<Character>) => {
    if (editingCharacter) {
      await onUpdateCharacter(editingCharacter.id, character);
    } else {
      await onAddCharacter(character);
    }
    setIsCharacterEditorOpen(false);
    setEditingCharacter(null);
  };

  const handleGenerateCharacter = async (field: string): Promise<string> => {
    if (!editingCharacter?.name && !isCharacterEditorOpen) return '';
    const name = editingCharacter?.name || 'New Character';
    const result = await onGenerateCharacterContent(name);
    if (result && result[field]) {
      return result[field];
    }
    return '';
  };

  const handleGenerateCharacterImage = async () => {
    if (!editingCharacter?.name) return;
    const prompt = `Realistic portrait photo of a person: ${editingCharacter.appearance || editingCharacter.name}. Professional headshot style, neutral background, photorealistic.`;
    const result = await onGenerateImage(prompt, 'characters', editingCharacter.id);
    if (result?.imageUrl && editingCharacter) {
      await onUpdateCharacter(editingCharacter.id, { ...editingCharacter, imageUrl: result.imageUrl });
    }
  };

  // Location handlers
  const handleAddLocation = () => {
    setEditingLocation(null);
    setIsLocationEditorOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsLocationEditorOpen(true);
  };

  const handleSaveLocation = async (location: Partial<Location>) => {
    if (editingLocation) {
      await onUpdateLocation(editingLocation.id, location);
    } else {
      await onAddLocation(location);
    }
    setIsLocationEditorOpen(false);
    setEditingLocation(null);
  };

  const handleGenerateLocation = async (field: string): Promise<string> => {
    if (!editingLocation?.name && !isLocationEditorOpen) return '';
    const name = editingLocation?.name || 'New Location';
    const result = await onGenerateLocationContent(name);
    if (result && result[field]) {
      return result[field];
    }
    return '';
  };

  const handleGenerateLocationImage = async () => {
    if (!editingLocation?.name) return;
    const prompt = `Photorealistic image of a location: ${editingLocation.description || editingLocation.name}. ${editingLocation.atmosphere || ''}. Cinematic, high detail, no people.`;
    const result = await onGenerateImage(prompt, 'locations', editingLocation.id);
    if (result?.imageUrl && editingLocation) {
      await onUpdateLocation(editingLocation.id, { ...editingLocation, imageUrl: result.imageUrl });
    }
  };

  return (
    <>
      <div className="glass rounded-2xl h-full flex flex-col overflow-hidden shadow-2xl">
        <div className="flex border-b border-accent-cyan/20 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-4 font-semibold transition-all text-xs whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-text-primary bg-gradient-to-b from-accent-cyan/20 to-transparent border-b-2 border-accent-cyan'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'inventory' && (
            <InventoryView items={playerState.inventory} />
          )}

          {activeTab === 'quests' && <QuestLog quests={playerState.quests} />}

          {activeTab === 'profile' && (
            <div className="p-4 space-y-4">
              <div className="glass-elevated rounded-xl p-4 text-center">
                {playerState.imageUrl ? (
                  <img
                    src={playerState.imageUrl}
                    alt={playerState.name}
                    className="w-20 h-20 mx-auto mb-3 rounded-full object-cover border-2 border-accent-cyan/30"
                  />
                ) : (
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-accent-cyan to-accent-emerald flex items-center justify-center">
                    <span className="text-2xl font-bold text-bg-dark">
                      {(playerState.name || 'P').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-text-primary mb-1">
                  {playerState.name || 'Player'}
                </h2>
                <p className="text-accent-cyan text-sm font-medium">
                  {playerState.role || playerState.class || 'Participant'}
                </p>
              </div>

              {playerState.appearance && (
                <div className="glass-elevated rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2 text-text-primary">Appearance</h3>
                  <p className="text-xs text-text-secondary">{playerState.appearance}</p>
                </div>
              )}

              {playerState.background && (
                <div className="glass-elevated rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2 text-text-primary">Background</h3>
                  <p className="text-xs text-text-secondary">{playerState.background}</p>
                </div>
              )}

              {playerState.personality && (
                <div className="glass-elevated rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2 text-text-primary">Personality</h3>
                  <p className="text-xs text-text-secondary">{playerState.personality}</p>
                </div>
              )}

              {playerState.goals && (
                <div className="glass-elevated rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2 text-text-primary">Goals</h3>
                  <p className="text-xs text-text-secondary">{playerState.goals}</p>
                </div>
              )}

              {playerState.notes.length > 0 && (
                <div className="glass-elevated rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2 text-text-primary">Notes</h3>
                  <div className="space-y-2">
                    {playerState.notes.map((note, index) => (
                      <div
                        key={index}
                        className="text-xs text-text-secondary bg-bg-dark/50 rounded-lg p-2"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="p-4">
              <CharacterList
                characters={characters}
                onAdd={handleAddCharacter}
                onEdit={handleEditCharacter}
                onDelete={onDeleteCharacter}
              />
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="p-4">
              <LocationList
                locations={locations}
                onAdd={handleAddLocation}
                onEdit={handleEditLocation}
                onDelete={onDeleteLocation}
              />
            </div>
          )}
        </div>
      </div>

      {/* Character Editor Modal */}
      <CharacterEditor
        character={editingCharacter || undefined}
        isOpen={isCharacterEditorOpen}
        onSave={handleSaveCharacter}
        onCancel={() => {
          setIsCharacterEditorOpen(false);
          setEditingCharacter(null);
        }}
        onGenerate={handleGenerateCharacter}
        onGenerateImage={handleGenerateCharacterImage}
        isLoading={isLoading}
      />

      {/* Location Editor Modal */}
      <LocationEditor
        location={editingLocation || undefined}
        isOpen={isLocationEditorOpen}
        onSave={handleSaveLocation}
        onCancel={() => {
          setIsLocationEditorOpen(false);
          setEditingLocation(null);
        }}
        onGenerate={handleGenerateLocation}
        onGenerateImage={handleGenerateLocationImage}
        isLoading={isLoading}
      />
    </>
  );
};
