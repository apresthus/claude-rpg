export interface Message {
  id: string;
  type: 'gm' | 'player';
  content: string;
  timestamp: number;
}

export interface Item {
  name: string;
  description?: string;
  icon?: string;
}

export interface Quest {
  id: string;
  title: string;
  completed: boolean;
}

export interface PlayerState {
  name: string;
  class: string;
  inventory: Item[];
  quests: Quest[];
  notes: string[];
  stats?: Record<string, number>;
}

export interface GameState {
  campaignName: string;
  messages: Message[];
  playerState: PlayerState;
  isLoading: boolean;
}

export interface ApiResponse {
  narrative: string;
  playerState?: Partial<PlayerState>;
}

export interface HistoryEntry {
  player: string;
  gm: string;
}
