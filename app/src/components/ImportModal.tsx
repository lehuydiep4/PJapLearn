import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Deck } from '../types';
import { parseCSVAndImportKanji } from '../utils/csvImport';

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
        alert('Vui lòng nhập tên cho bộ thẻ mới');
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

    parseCSVAndImportKanji(
      file,
      targetDeck,
      kanjiMaster,
      async (updatedKanjiMaster, newCards) => {
        setKanjiMaster(updatedKanjiMaster);
        const updatedDeck = { ...targetDeck!, cards: [...targetDeck!.cards, ...newCards] };
        await updateDeck(updatedDeck.deckId, updatedDeck);
        setIsImporting(false);
        onClose();
      },
      (errorMsg) => {
        alert('Lỗi đọc file CSV: ' + errorMsg);
        setIsImporting(false);
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-xl w-full max-w-md border">
        <h2 className="text-2xl font-bold mb-4">Nhập thẻ từ CSV</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Chọn bộ thẻ (Target Deck)</label>
          <select 
            className="w-full p-2 rounded bg-background border"
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
          >
            {decks.map(d => (
              <option key={d.deckId} value={d.deckId}>{d.deckName}</option>
            ))}
            <option value="new">+ Tạo bộ thẻ mới</option>
          </select>
        </div>

        {selectedDeckId === 'new' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tên bộ thẻ mới</label>
            <input 
              type="text" 
              className="w-full p-2 rounded bg-background border"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="VD: Từ vựng JLPT N3"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tải lên file CSV</label>
          <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/20 transition-colors">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
              <span className="text-primary font-medium mb-2">Bấm để chọn file CSV</span>
              <span className="text-xs text-muted-foreground">Các cột bắt buộc: Kanji, Ý nghĩa, Kunyomi, Onyomi, Ví dụ</span>
            </label>
          </div>
          {file && <p className="mt-2 text-sm text-green-500 font-medium">Đã chọn: {file.name}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-secondary"
            disabled={isImporting}
          >
            Hủy
          </button>
          <button 
            onClick={handleImport}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={!file || isImporting}
          >
            {isImporting ? 'Đang nhập...' : 'Nhập thẻ'}
          </button>
        </div>
      </div>
    </div>
  );
};
