import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';

export const ParagraphReader: React.FC = () => {
  const [text, setText] = useState('');
  const { vocabMaster, kanjiMaster } = useAppStore();

  // Basic implementation: we'll just scan the text for any known vocab and highlight them.
  // In a real app, this could use a trie or Aho-Corasick algorithm for performance.
  const renderTextWithHighlights = () => {
    if (!text) return null;

    // A very naive string replacement logic for demo purposes
    // We should split by known words
    let result: React.ReactNode[] = [text];
    
    Object.values(vocabMaster).forEach(vocab => {
      const newResult: React.ReactNode[] = [];
      result.forEach(part => {
        if (typeof part === 'string') {
          const splits = part.split(vocab.word);
          splits.forEach((s, idx) => {
            newResult.push(s);
            if (idx < splits.length - 1) {
              newResult.push(
                <span key={`${vocab.word}-${idx}`} className="relative group cursor-pointer bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded px-0.5 underline decoration-dotted">
                  {vocab.word}
                  <div className="absolute z-10 hidden group-hover:block bg-popover text-popover-foreground p-3 rounded-md shadow-md text-sm bottom-full mb-2 w-48 border font-normal">
                    <p className="font-bold">{vocab.word} ({vocab.reading})</p>
                    <p>{vocab.meaning}</p>
                  </div>
                </span>
              );
            }
          });
        } else {
          newResult.push(part);
        }
      });
      result = newResult;
    });

    return result;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Paragraph Reader</h2>
      <div className="flex gap-4 mb-6">
        <textarea
          className="w-1/2 h-64 p-3 border rounded-md bg-input text-foreground"
          placeholder="Dán đoạn văn tiếng Nhật vào đây..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="w-1/2 h-64 p-3 border rounded-md bg-card overflow-y-auto leading-relaxed text-lg">
          {renderTextWithHighlights()}
        </div>
      </div>
      <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md">
        Save Paragraph to Deck
      </button>
    </div>
  );
};
