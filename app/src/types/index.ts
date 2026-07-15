export interface SRSData {
  interval: number;       // Current interval in days
  repetition: number;     // Number of consecutive successful recalls
  easeFactor: number;     // SM-2 Ease factor (default: 2.5)
  nextReviewDate: string; // ISO 8601 Date String
}

export interface KanjiMasterEntry {
  kanji: string;
  hanViet?: string;
  onyomi?: string;
  kunyomi?: string;
  meaning: string;
  examples?: string[];
  customNotes?: string;
}

export interface VocabMasterEntry {
  word: string;
  reading?: string;
  meaning: string;
  kanjiIds?: string[]; // References to kanji in kanji_master
  examples?: string[];
  customNotes?: string;
}

export interface DeckCardReference {
  itemId: string; // ID referencing kanji_master, vocab_master, or a raw string for custom sentences/paragraphs
  itemType: 'kanji' | 'vocab' | 'sentence' | 'paragraph';
  srsData: SRSData;
  // Optional raw content if the item is not stored in master (like a one-off sentence or paragraph)
  customFront?: string; 
  customBack?: string; 
}

export interface Deck {
  deckId: string;
  deckName: string;
  description?: string;
  createdAt: string;
  lastStudied: string;
  cards: DeckCardReference[];
}

export interface AppSettings {
  aiProvider: 'gemini' | 'openai' | 'claude' | 'openrouter';
  apiKey: string;
  model: string;
  theme: 'light' | 'dark' | 'system';
  defaultEaseFactor: number; // Default 2.5
}

export type KanjiMasterMap = Record<string, KanjiMasterEntry>;
export type VocabMasterMap = Record<string, VocabMasterEntry>;
