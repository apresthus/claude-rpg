import { useState, useCallback } from 'react';
import {
  ApiResponse,
  PlayerState,
  HistoryEntry,
  Item,
  Quest,
  Character,
  Location,
  GeneratedContent,
  GeneratedImage,
  RoleplayInfo,
} from '../types/game';

const API_BASE = '/api';

// Parse player.md markdown into structured data
function parsePlayerMarkdown(content: string): Partial<PlayerState> {
  const result: Partial<PlayerState> = {
    inventory: [],
    quests: [],
    notes: [],
  };

  // Extract name
  const nameMatch = content.match(/Name:\s*(.+)/);
  if (nameMatch) result.name = nameMatch[1].trim();

  // Extract class (backwards compatibility)
  const classMatch = content.match(/Class:\s*(.+)/);
  if (classMatch) result.class = classMatch[1].trim();

  // Extract role (new field)
  const roleMatch = content.match(/Role:\s*(.+)/);
  if (roleMatch) result.role = roleMatch[1].trim();

  // Helper to extract section content
  const extractSection = (header: string): string => {
    const regex = new RegExp(`# ${header}\\n([\\s\\S]*?)(?=\\n#|$)`);
    const match = content.match(regex);
    if (match) {
      return match[1].trim();
    }
    return '';
  };

  // Extract enhanced profile fields
  result.appearance = extractSection('Appearance') || undefined;
  result.background = extractSection('Background') || undefined;
  result.personality = extractSection('Personality') || undefined;
  result.goals = extractSection('Goals') || undefined;
  result.skills = extractSection('Skills') || undefined;
  result.relationships = extractSection('Relationships') || undefined;

  // Extract inventory items
  const inventorySection = content.match(/# Inventory\n([\s\S]*?)(?=\n#|$)/);
  if (inventorySection) {
    const items = inventorySection[1].match(/^-\s+(.+)$/gm);
    if (items) {
      result.inventory = items.map((item): Item => ({
        name: item.replace(/^-\s+/, '').trim(),
      }));
    }
  }

  // Extract quests
  const questSection = content.match(/# Quest Log\n([\s\S]*?)(?=\n#|$)/);
  if (questSection) {
    const quests = questSection[1].match(/^-\s+\[(.)\]\s+(.+)$/gm);
    if (quests) {
      result.quests = quests.map((quest, idx): Quest => {
        const match = quest.match(/^-\s+\[(.)\]\s+(.+)$/);
        return {
          id: `quest-${idx}`,
          title: match ? match[2].trim() : quest,
          completed: match ? match[1] === 'x' : false,
        };
      });
    }
  }

  // Extract notes
  const notesSection = content.match(/# Notes\n([\s\S]*?)(?=\n#|$)/);
  if (notesSection) {
    const notes = notesSection[1].match(/^-\s+(.+)$/gm);
    if (notes) {
      result.notes = notes.map((note) => note.replace(/^-\s+/, '').trim());
    }
  }

  return result;
}

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Game messaging
  const sendMessage = useCallback(async (message: string): Promise<ApiResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (): Promise<HistoryEntry[] | null> => {
    try {
      const response = await fetch(`${API_BASE}/history`);
      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return null;
    }
  }, []);

  // Player management
  const getPlayerState = useCallback(async (): Promise<{ state: Partial<PlayerState>; imageUrl?: string } | null> => {
    try {
      const response = await fetch(`${API_BASE}/player`);
      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.content) {
        const state = parsePlayerMarkdown(data.content);
        return { state, imageUrl: data.imageUrl };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const updatePlayerState = useCallback(async (content: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/player`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const addNote = useCallback(async (note: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/player/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const uploadPlayerImage = useCallback(async (imageData: string, mimeType: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE}/player/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, mimeType }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.imageUrl || null;
    } catch {
      return null;
    }
  }, []);

  // Campaign management (legacy)
  const createCampaign = useCallback(
    async (campaignName: string, playerName: string, playerRole: string): Promise<RoleplayInfo | null> => {
      try {
        const response = await fetch(`${API_BASE}/campaign/new`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignName, playerName, playerRole }),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.roleplay || null;
      } catch {
        return null;
      }
    },
    []
  );

  // Roleplay management
  const getRoleplays = useCallback(async (): Promise<RoleplayInfo[]> => {
    try {
      const response = await fetch(`${API_BASE}/roleplays`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, []);

  const getCurrentRoleplay = useCallback(async (): Promise<RoleplayInfo | null> => {
    try {
      const response = await fetch(`${API_BASE}/roleplay/current`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  const createRoleplay = useCallback(
    async (name: string, playerName: string, playerRole: string): Promise<RoleplayInfo | null> => {
      try {
        const response = await fetch(`${API_BASE}/roleplays`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, playerName, playerRole }),
        });
        if (!response.ok) return null;
        return await response.json();
      } catch {
        return null;
      }
    },
    []
  );

  const loadRoleplay = useCallback(async (id: string): Promise<RoleplayInfo | null> => {
    try {
      const response = await fetch(`${API_BASE}/roleplays/${id}/load`, {
        method: 'PUT',
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  const deleteRoleplay = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/roleplays/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Characters CRUD
  const getCharacters = useCallback(async (): Promise<Character[]> => {
    try {
      const response = await fetch(`${API_BASE}/characters`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, []);

  const getCharacter = useCallback(async (id: string): Promise<Character | null> => {
    try {
      const response = await fetch(`${API_BASE}/characters/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  const createCharacter = useCallback(async (character: Partial<Character>): Promise<Character | null> => {
    try {
      const response = await fetch(`${API_BASE}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  const updateCharacter = useCallback(async (id: string, character: Partial<Character>): Promise<Character | null> => {
    try {
      const response = await fetch(`${API_BASE}/characters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  const deleteCharacter = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/characters/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Locations CRUD
  const getLocations = useCallback(async (): Promise<Location[]> => {
    try {
      const response = await fetch(`${API_BASE}/locations`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, []);

  const getLocation = useCallback(async (id: string): Promise<Location | null> => {
    try {
      const response = await fetch(`${API_BASE}/locations/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  const createLocation = useCallback(async (location: Partial<Location>): Promise<Location | null> => {
    try {
      const response = await fetch(`${API_BASE}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  const updateLocation = useCallback(async (id: string, location: Partial<Location>): Promise<Location | null> => {
    try {
      const response = await fetch(`${API_BASE}/locations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  const deleteLocation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/locations/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // AI Generation
  const generateCharacterContent = useCallback(async (name: string, existing?: string): Promise<GeneratedContent | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate/character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, existing }),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateLocationContent = useCallback(async (name: string, existing?: string): Promise<GeneratedContent | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, existing }),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateImage = useCallback(async (prompt: string, category?: string, id?: string): Promise<GeneratedImage | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category, id }),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Game messaging
    sendMessage,
    getHistory,
    // Player
    getPlayerState,
    updatePlayerState,
    addNote,
    uploadPlayerImage,
    // Campaign (legacy)
    createCampaign,
    // Roleplays
    getRoleplays,
    getCurrentRoleplay,
    createRoleplay,
    loadRoleplay,
    deleteRoleplay,
    // Characters
    getCharacters,
    getCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    // Locations
    getLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    // AI Generation
    generateCharacterContent,
    generateLocationContent,
    generateImage,
    // State
    isLoading,
    error,
  };
};
