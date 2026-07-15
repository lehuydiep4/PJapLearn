import { create } from 'zustand';
import { Deck, KanjiMasterMap, VocabMasterMap, AppSettings } from '../types';
import { initializeStorage, loadMasterData, loadAllDecks, saveMasterData, saveDeck } from '../services/storageService';

const defaultSettings: AppSettings = {
  aiProvider: 'openrouter',
  apiKey: '',
  model: '',
  theme: 'system',
  defaultEaseFactor: 2.5
};

const loadSettings = (): AppSettings => {
  const saved = localStorage.getItem('memoriAI_settings');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return defaultSettings;
}

interface AppState {
  decks: Deck[];
  kanjiMaster: KanjiMasterMap;
  vocabMaster: VocabMasterMap;
  settings: AppSettings;
  isInitialized: boolean;
  setDecks: (decks: Deck[]) => void;
  setKanjiMaster: (data: KanjiMasterMap) => void;
  setVocabMaster: (data: VocabMasterMap) => void;
  updateSettings: (settings: AppSettings) => void;
  initializeApp: (fallbackMocks: { kanji: KanjiMasterMap, vocab: VocabMasterMap, deck: Deck }) => Promise<void>;
  updateDeck: (deck: Deck) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  decks: [],
  kanjiMaster: {},
  vocabMaster: {},
  settings: loadSettings(),
  isInitialized: false,
  setDecks: (decks) => set({ decks }),
  setKanjiMaster: (kanjiMaster) => set({ kanjiMaster }),
  setVocabMaster: (vocabMaster) => set({ vocabMaster }),
  updateSettings: (settings) => {
    localStorage.setItem('memoriAI_settings', JSON.stringify(settings));
    set({ settings });
  },
  
  initializeApp: async (fallbackMocks) => {
    // If running in browser without Tauri, we might get errors from Tauri API. 
    // We catch them and fallback to mocks.
    try {
      await initializeStorage();
      
      let loadedKanji = await loadMasterData<KanjiMasterMap>('kanji_master.json');
      let loadedVocab = await loadMasterData<VocabMasterMap>('vocab_master.json');
      let loadedDecks = await loadAllDecks();

      // If empty, populate with mocks and save to disk
      if (!loadedKanji) {
        loadedKanji = fallbackMocks.kanji;
        await saveMasterData('kanji_master.json', loadedKanji);
      }
      
      if (!loadedVocab) {
        loadedVocab = fallbackMocks.vocab;
        await saveMasterData('vocab_master.json', loadedVocab);
      }

      if (loadedDecks.length === 0) {
        loadedDecks = [fallbackMocks.deck];
        await saveDeck(fallbackMocks.deck);
      }

      set({
        kanjiMaster: loadedKanji,
        vocabMaster: loadedVocab,
        decks: loadedDecks,
        isInitialized: true
      });

    } catch (e) {
      console.warn("Could not load from Tauri FS, falling back to in-memory mocks.", e);
      set({
        kanjiMaster: fallbackMocks.kanji,
        vocabMaster: fallbackMocks.vocab,
        decks: [fallbackMocks.deck],
        isInitialized: true
      });
    }
  },

  updateDeck: async (deck) => {
    try {
      await saveDeck(deck);
    } catch (e) {
      console.warn("Failed to save to FS", e);
    }
    const currentDecks = get().decks;
    const index = currentDecks.findIndex(d => d.deckId === deck.deckId);
    if (index >= 0) {
      const newDecks = [...currentDecks];
      newDecks[index] = deck;
      set({ decks: newDecks });
    } else {
      set({ decks: [...currentDecks, deck] });
    }
  }
}));
