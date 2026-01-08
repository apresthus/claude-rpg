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
  class: string;  // Keep for backwards compatibility
  role?: string;  // New field
  inventory: Item[];
  quests: Quest[];
  notes: string[];
  stats?: Record<string, number>;
  // Enhanced profile fields
  appearance?: string;
  background?: string;
  personality?: string;
  goals?: string;
  skills?: string;
  relationships?: string;
  imageUrl?: string;
}

export interface RoleplayInfo {
  id: string;
  name: string;
  playerName?: string;
  playerRole?: string;
  created: string;
  lastPlayed: string;
}

export interface GameState {
  currentRoleplay: RoleplayInfo | null;
  messages: Message[];
  playerState: PlayerState;
  isLoading: boolean;
  characters: Character[];
  locations: Location[];
}

export interface ApiResponse {
  narrative: string;
  playerState?: Partial<PlayerState>;
}

export interface HistoryEntry {
  player: string;
  gm: string;
}

// Character management
export interface Character {
  id: string;
  name: string;
  role?: string;
  firstEncountered?: string;
  appearance?: string;
  background?: string;
  motivations?: string;
  personality?: string;
  knows?: string;
  doesntKnow?: string;
  imagePath?: string;
  imageUrl?: string;
}

// Location management
export interface Location {
  id: string;
  name: string;
  type?: string;
  district?: string;
  description?: string;
  atmosphere?: string;
  notableFeatures?: string;
  npcsPresent?: string;
  imagePath?: string;
  imageUrl?: string;
}

// Generation requests
export interface GenerateCharacterRequest {
  name: string;
  existing?: string;
}

export interface GenerateLocationRequest {
  name: string;
  existing?: string;
}

export interface GenerateImageRequest {
  prompt: string;
  category?: string;
  id?: string;
}

export interface GeneratedContent {
  appearance?: string;
  background?: string;
  motivations?: string;
  personality?: string;
  description?: string;
  atmosphere?: string;
  notableFeatures?: string;
}

export interface GeneratedImage {
  imageData: string;
  mimeType: string;
  imageUrl?: string;
}
