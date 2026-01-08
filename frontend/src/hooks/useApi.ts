import { useState, useCallback } from 'react';
import { ApiResponse, PlayerState, HistoryEntry } from '../types/game';

const API_BASE = '/api';

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const getPlayerState = useCallback(async (): Promise<PlayerState | null> => {
    try {
      const response = await fetch(`${API_BASE}/player`);
      if (!response.ok) return null;
      const data = await response.json();
      return data;
    } catch {
      return null;
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

  const createCampaign = useCallback(
    async (campaignName: string, playerName: string, playerClass: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE}/campaign/new`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignName, playerName, playerClass }),
        });
        return response.ok;
      } catch {
        return false;
      }
    },
    []
  );

  const getHistory = useCallback(async (): Promise<HistoryEntry[] | null> => {
    try {
      const response = await fetch(`${API_BASE}/history`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  return {
    sendMessage,
    getPlayerState,
    addNote,
    createCampaign,
    getHistory,
    isLoading,
    error,
  };
};
