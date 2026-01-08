import { useState, useCallback, useEffect } from 'react';
import { GameState, Message } from '../types/game';
import { useApi } from './useApi';

const initialState: GameState = {
  campaignName: 'New Adventure',
  messages: [],
  playerState: {
    name: 'Adventurer',
    class: 'Wanderer',
    inventory: [],
    quests: [],
    notes: [],
  },
  isLoading: false,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const api = useApi();

  useEffect(() => {
    const loadPlayerState = async () => {
      const playerState = await api.getPlayerState();
      if (playerState) {
        setGameState((prev) => ({ ...prev, playerState }));
      }
    };

    const loadHistory = async () => {
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
    };

    loadPlayerState();
    loadHistory();
  }, []);

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

      setGameState((prev) => ({
        ...prev,
        messages: [...prev.messages, gmMessage],
        playerState: { ...prev.playerState, ...response.playerState },
        isLoading: false,
      }));
    } else {
      setGameState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [api]);

  const createNewCampaign = useCallback(
    async (campaignName: string, playerName: string, playerClass: string) => {
      const success = await api.createCampaign(campaignName, playerName, playerClass);
      if (success) {
        setGameState({
          campaignName,
          messages: [],
          playerState: {
            name: playerName,
            class: playerClass,
            inventory: [],
            quests: [],
            notes: [],
          },
          isLoading: false,
        });
      }
      return success;
    },
    [api]
  );

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

  return {
    gameState,
    sendMessage,
    createNewCampaign,
    addPlayerNote,
    isLoading: api.isLoading,
    error: api.error,
  };
};
