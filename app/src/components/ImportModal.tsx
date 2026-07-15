import React, { useState } from 'react';
import Papa from 'papaparse';
import { useAppStore } from '../store/appStore';
import { createDefaultSRSData } from '../utils/sm2';
import { DeckCardReference, Deck } from '../types';

interface ImportModalProps {
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose }) => {
  const { decks, kanjiMaster, setKanjiMaster, updateDeck } = useAppStore();
  const [selectedDeckId, setSelectedDeckId] = useState(decks[0]?.deckId || 'new');
  const [newDeckName, setNewDeckName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) return;

    let targetDeck: Deck | undefined;

    if (selectedDeckId === 'new') {
      if (!newDeckName.trim()) {
        alert('Please enter a new deck name');
        return;
      }
      targetDeck = {
        deckId: crypto.randomUUID(),
        deckName: newDeckName,
        createdAt: new Date().toISOString(),
        lastStudied: new Date().toISOString(),
        cards: []
      };
    } else {
      targetDeck = decks.find(d => d.deckId === selectedDeckId);
    }

    if (!targetDeck) return;

    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
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
          const alreadyExists = targetDeck!.cards.find(c => c.itemId === itemId && c.itemType === 'kanji');
          
          if (!alreadyExists) {
            newCards.push({
              itemId,
              itemType: 'kanji',
              srsData: createDefaultSRSData()
            });
          }
        });

        // Save to store and FS
        setKanjiMaster(updatedKanjiMaster);
        
        const updatedDeck = { ...targetDeck, cards: [...targetDeck.cards, ...newCards] };
        await updateDeck(updatedDeck);
        
        setIsImporting(false);
        onClose();
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message);
        setIsImporting(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-xl w-full max-w-md border">
        <h2 className="text-2xl font-bold mb-4">Import CSV</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Target Deck</label>
          <select 
            className="w-full p-2 rounded bg-background border"
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
          >
            {decks.map(d => (
              <option key={d.deckId} value={d.deckId}>{d.deckName}</option>
            ))}
            <option value="new">+ Create New Deck</option>
          </select>
        </div>

        {selectedDeckId === 'new' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">New Deck Name</label>
            <input 
              type="text" 
              className="w-full p-2 rounded bg-background border"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="E.g., JLPT N3 Vocabulary"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">CSV File</label>
          <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/20 transition-colors">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
              <span className="text-primary font-medium mb-2">Click to select CSV</span>
              <span className="text-xs text-muted-foreground">Required columns: Kanji, Ý nghĩa, Kunyomi, Onyomi, Ví dụ</span>
            </label>
          </div>
          {file && <p className="mt-2 text-sm text-green-500 font-medium">Selected: {file.name}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-secondary"
            disabled={isImporting}
          >
            Cancel
          </button>
          <button 
            onClick={handleImport}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={!file || isImporting}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};
