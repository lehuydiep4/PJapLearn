import { BaseDirectory, writeTextFile, readTextFile, exists, mkdir, readDir } from '@tauri-apps/plugin-fs';
import { documentDir, join } from '@tauri-apps/api/path';
import { Deck, KanjiMasterMap, VocabMasterMap } from '../types';

const APP_DIR = 'MemoriAI_Decks';

export const initializeStorage = async () => {
  try {
    const docDirPath = await documentDir();
    const appDirPath = await join(docDirPath, APP_DIR);
    
    // Fallback using BaseDirectory if absolute path is not allowed depending on configuration
    const dirExists = await exists(APP_DIR, { baseDir: BaseDirectory.Document });
    
    if (!dirExists) {
      await mkdir(APP_DIR, { baseDir: BaseDirectory.Document, recursive: true });
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
};

export const loadMasterData = async <T>(filename: string): Promise<T | null> => {
  try {
    const filePath = await join(APP_DIR, filename);
    const fileExists = await exists(filePath, { baseDir: BaseDirectory.Document });
    
    if (fileExists) {
      const contents = await readTextFile(filePath, { baseDir: BaseDirectory.Document });
      return JSON.parse(contents) as T;
    }
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error);
  }
  return null;
};

export const saveMasterData = async <T>(filename: string, data: T): Promise<void> => {
  try {
    const filePath = await join(APP_DIR, filename);
    await writeTextFile(filePath, JSON.stringify(data, null, 2), { baseDir: BaseDirectory.Document });
  } catch (error) {
    console.error(`Failed to save ${filename}:`, error);
  }
};

export const loadAllDecks = async (): Promise<Deck[]> => {
  const decks: Deck[] = [];
  try {
    const entries = await readDir(APP_DIR, { baseDir: BaseDirectory.Document });
    
    for (const entry of entries) {
      if (entry.name && entry.name.startsWith('deck_') && entry.name.endsWith('.json')) {
        const filePath = await join(APP_DIR, entry.name);
        const contents = await readTextFile(filePath, { baseDir: BaseDirectory.Document });
        decks.push(JSON.parse(contents) as Deck);
      }
    }
  } catch (error) {
    console.error('Failed to load decks:', error);
  }
  return decks;
};

export const saveDeck = async (deck: Deck): Promise<void> => {
  try {
    const filename = `deck_${deck.deckId}.json`;
    const filePath = await join(APP_DIR, filename);
    await writeTextFile(filePath, JSON.stringify(deck, null, 2), { baseDir: BaseDirectory.Document });
  } catch (error) {
    console.error(`Failed to save deck ${deck.deckId}:`, error);
  }
};
