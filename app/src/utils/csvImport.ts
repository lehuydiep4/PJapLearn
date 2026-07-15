import Papa from 'papaparse';
import { KanjiEntry, DeckCardReference, Deck } from '../types';
import { createDefaultSRSData } from './sm2';

export const parseCSVAndImportKanji = (
  file: File,
  targetDeck: Deck,
  kanjiMaster: Record<string, KanjiEntry>,
  onSuccess: (updatedKanjiMaster: Record<string, KanjiEntry>, newCards: DeckCardReference[]) => void,
  onError: (errorMsg: string) => void
) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const newCards: DeckCardReference[] = [];
      const updatedKanjiMaster = { ...kanjiMaster };

      results.data.forEach((row: any) => {
        // Flexible column matching
        const kanji = row['Kanji'] || row['kanji'] || '';
        if (!kanji) return; // Skip invalid rows

        const meaning = row['Ý nghĩa'] || row['ý nghĩa'] || row['Meaning'] || '';
        const kunyomi = row['Kunyomi'] || row['kunyomi'] || '';
        const onyomi = row['Onyomi'] || row['onyomi'] || '';
        const example = row['Ví dụ'] || row['ví dụ'] || row['Example'] || '';

        // Use the kanji itself as a unique ID in kanjiMaster
        const itemId = `kanji_${kanji}`;
        
        if (!updatedKanjiMaster[itemId]) {
          updatedKanjiMaster[itemId] = {
            kanji,
            meaning,
            kunyomi,
            onyomi,
            examples: example ? [example] : []
          };
        }

        // Check if card already exists in the target deck to avoid exact duplicates
        const alreadyExists = targetDeck.cards.find(c => c.itemId === itemId && c.itemType === 'kanji');
        
        if (!alreadyExists) {
          newCards.push({
            itemId,
            itemType: 'kanji',
            srsData: createDefaultSRSData()
          });
        }
      });

      onSuccess(updatedKanjiMaster, newCards);
    },
    error: (error) => {
      onError(error.message);
    }
  });
};
