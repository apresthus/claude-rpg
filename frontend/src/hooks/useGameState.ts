import { useState, useCallback, useEffect } from 'react';
import { GameState, Message, Character, Location, PlayerState } from '../types/game';
import { useApi } from './useApi';

const initialState: GameState = {
  campaignName: 'New Session',
  messages: [],
  playerState: {
    name: 'Player',
    class: 'Participant',
    role: 'Participant',
    inventory: [],
    quests: [],
    notes: [],
  },
  isLoading: false,
  characters: [],
  locations: [],
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const api = useApi();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load player state
      const playerResult = await api.getPlayerState();
      if (playerResult) {
        setGameState((prev) => ({
          ...prev,
          playerState: {
            ...prev.playerState,
            ...playerResult.state,
            imageUrl: playerResult.imageUrl,
          },
        }));
      }

      // Load history
      const history = await api.getHistory();
      if (history && history.length > 0) {
        const messages: Message[] = history.flatMap((entry, index) => [
          {
            id: `${index}-player`,
            type: 'player' as const,
            content: entry.player || '',
            timestamp: Date.now() - (history.length - index) * 1000,
          },
          {
            id: `${index}-gm`,
            type: 'gm' as const,
            content: entry.gm || '',
            timestamp: Date.now() - (history.length - index) * 1000 + 500,
          },
        ]);
        setGameState((prev) => ({ ...prev, messages }));
      }

      // Load characters
      const characters = await api.getCharacters();
      setGameState((prev) => ({ ...prev, characters }));

      // Load locations
      const locations = await api.getLocations();
      setGameState((prev) => ({ ...prev, locations }));
    };

    loadInitialData();
  }, []);

  // Game messaging
  const sendMessage = useCallback(async (content: string) => {
    const playerMessage: Message = {
      id: `${Date.now()}-player`,
      type: 'player',
      content,
      timestamp: Date.now(),
    };

    setGameState((prev) => ({
      ...prev,
      messages: [...prev.messages, playerMessage],
      isLoading: true,
    }));

    const response = await api.sendMessage(content);

    if (response && response.narrative) {
      const gmMessage: Message = {
        id: `${Date.now()}-gm`,
        type: 'gm',
        content: response.narrative,
        timestamp: Date.now(),
      };

      // Reload player state to get any updates
      const playerResult = await api.getPlayerState();

      setGameState((prev) => ({
        ...prev,
        messages: [...prev.messages, gmMessage],
        playerState: playerResult
          ? { ...prev.playerState, ...playerResult.state, imageUrl: playerResult.imageUrl }
          : prev.playerState,
        isLoading: false,
      }));
    } else {
      setGameState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [api]);

  // Campaign management
  const createNewCampaign = useCallback(
    async (campaignName: string, playerName: string, playerRole: string) => {
      const success = await api.createCampaign(campaignName, playerName, playerRole);
      if (success) {
        setGameState({
          campaignName,
          messages: [],
          playerState: {
            name: playerName,
            class: playerRole,
            role: playerRole,
            inventory: [],
            quests: [],
            notes: [],
          },
          isLoading: false,
          characters: [],
          locations: [],
        });
      }
      return success;
    },
    [api]
  );

  // Player notes
  const addPlayerNote = useCallback(
    async (note: string) => {
      const success = await api.addNote(note);
      if (success) {
        setGameState((prev) => ({
          ...prev,
          playerState: {
            ...prev.playerState,
            notes: [...prev.playerState.notes, note],
          },
        }));
      }
      return success;
    },
    [api]
  );

  // Characters management
  const addCharacter = useCallback(
    async (character: Partial<Character>) => {
      const created = await api.createCharacter(character);
      if (created) {
        setGameState((prev) => ({
          ...prev,
          characters: [...prev.characters, created],
        }));
      }
      return created;
    },
    [api]
  );

  const updateCharacter = useCallback(
    async (id: string, character: Partial<Character>) => {
      const updated = await api.updateCharacter(id, character);
      if (updated) {
        setGameState((prev) => ({
          ...prev,
          characters: prev.characters.map((c) => (c.id === id ? updated : c)),
        }));
      }
      return updated;
    },
    [api]
  );

  const removeCharacter = useCallback(
    async (id: string) => {
      const success = await api.deleteCharacter(id);
      if (success) {
        setGameState((prev) => ({
          ...prev,
          characters: prev.characters.filter((c) => c.id !== id),
        }));
      }
      return success;
    },
    [api]
  );

  const refreshCharacters = useCallback(async () => {
    const characters = await api.getCharacters();
    setGameState((prev) => ({ ...prev, characters }));
  }, [api]);

  // Locations management
  const addLocation = useCallback(
    async (location: Partial<Location>) => {
      const created = await api.createLocation(location);
      if (created) {
        setGameState((prev) => ({
          ...prev,
          locations: [...prev.locations, created],
        }));
      }
      return created;
    },
    [api]
  );

  const updateLocation = useCallback(
    async (id: string, location: Partial<Location>) => {
      const updated = await api.updateLocation(id, location);
      if (updated) {
        setGameState((prev) => ({
          ...prev,
          locations: prev.locations.map((l) => (l.id === id ? updated : l)),
        }));
      }
      return updated;
    },
    [api]
  );

  const removeLocation = useCallback(
    async (id: string) => {
      const success = await api.deleteLocation(id);
      if (success) {
        setGameState((prev) => ({
          ...prev,
          locations: prev.locations.filter((l) => l.id !== id),
        }));
      }
      return success;
    },
    [api]
  );

  const refreshLocations = useCallback(async () => {
    const locations = await api.getLocations();
    setGameState((prev) => ({ ...prev, locations }));
  }, [api]);

  // Player profile update
  const updatePlayerImage = useCallback(
    async (imageData: string, mimeType: string) => {
      const imageUrl = await api.uploadPlayerImage(imageData, mimeType);
      if (imageUrl) {
        setGameState((prev) => ({
          ...prev,
          playerState: { ...prev.playerState, imageUrl },
        }));
      }
      return imageUrl;
    },
    [api]
  );

  const updatePlayerProfile = useCallback(
    async (profile: Partial<PlayerState>) => {
      // Build markdown content from profile
      const content = `# Character
Name: ${profile.name || ''}
Role: ${profile.role || profile.class || ''}

# Appearance
${profile.appearance || '(Not yet described)'}

# Background
${profile.background || '(Not yet written)'}

# Personality
${profile.personality || '(Not yet defined)'}

# Goals
${profile.goals || '(Not yet set)'}

# Skills
${profile.skills || '(Not yet defined)'}

# Inventory
${gameState.playerState.inventory.map(i => `- ${i.name}`).join('\n') || '- Basic supplies'}

# Quest Log
${gameState.playerState.quests.map(q => `- [${q.completed ? 'x' : ' '}] ${q.title}`).join('\n') || '(No quests yet)'}

# Notes
${gameState.playerState.notes.map(n => `- ${n}`).join('\n') || '(No notes yet)'}

# Relationships
${profile.relationships || '(No relationships yet)'}
`;
      const success = await api.updatePlayerState(content);
      if (success) {
        setGameState((prev) => ({
          ...prev,
          playerState: { ...prev.playerState, ...profile },
        }));
      }
    },
    [api, gameState.playerState]
  );

  return {
    gameState,
    // Game messaging
    sendMessage,
    // Campaign
    createNewCampaign,
    // Player
    addPlayerNote,
    updatePlayerImage,
    updatePlayerProfile,
    // Characters
    addCharacter,
    updateCharacter,
    removeCharacter,
    refreshCharacters,
    // Locations
    addLocation,
    updateLocation,
    removeLocation,
    refreshLocations,
    // AI Generation
    generateCharacterContent: api.generateCharacterContent,
    generateLocationContent: api.generateLocationContent,
    generateImage: api.generateImage,
    // State
    isLoading: api.isLoading,
    error: api.error,
  };
};
