import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { analyzeJapaneseText } from '../../services/kuromojiService';

export const SentenceParser: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [tokens, setTokens] = useState<any[]>([]);
  const { kanjiMaster, vocabMaster } = useAppStore();

  const handleParse = async () => {
    if (!inputText.trim()) return;
    
    try {
      const parsedTokens = await analyzeJapaneseText(inputText);
      setTokens(parsedTokens);
    } catch (err) {
      console.error("Kuromoji parsing error:", err);
    }
  };

  const renderTokenTooltip = (token: any) => {
    const word = token.surface_form;
    const vocabEntry = Object.values(vocabMaster).find(v => v.word === word);
    if (vocabEntry) {
      return (
        <div className="absolute z-10 hidden group-hover:block bg-popover text-popover-foreground p-3 rounded-md shadow-md text-sm bottom-full mb-2 w-48 border">
          <p className="font-bold">{vocabEntry.word} ({vocabEntry.reading})</p>
          <p>{vocabEntry.meaning}</p>
          {vocabEntry.kanjiIds && vocabEntry.kanjiIds.length > 0 && (
            <div className="mt-2 text-xs opacity-80">
              Kanji: {vocabEntry.kanjiIds.map(id => kanjiMaster[id]?.kanji).join(', ')}
            </div>
          )}
        </div>
      );
    }
    
    // Fallback save popover
    return (
      <div className="absolute z-10 hidden group-hover:flex flex-col gap-2 bg-card text-card-foreground p-2 rounded-md shadow-md text-sm bottom-full mb-2 border">
        <button className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Save Word</button>
        <button className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">Save Kanji</button>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sentence Parser</h2>
      <textarea
        className="w-full h-32 p-3 border rounded-md bg-input text-foreground mb-4"
        placeholder="Nhập câu tiếng Nhật vào đây..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button 
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md mb-6"
        onClick={handleParse}
      >
        Phân tích (Parse)
      </button>

      <div className="flex flex-wrap gap-2 text-xl">
        {tokens.map((token, index) => {
          const isKnown = Object.values(vocabMaster).some(v => v.word === token.surface_form);
          return (
            <div key={index} className="relative group cursor-pointer">
              <span className={`px-1 py-0.5 rounded ${isKnown ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 underline decoration-dotted' : 'hover:bg-accent'}`}>
                {token.surface_form}
              </span>
              {renderTokenTooltip(token)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
