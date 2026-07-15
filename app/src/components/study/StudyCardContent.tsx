import React from 'react';
import { KanjiEntry, VocabEntry } from '../../types';

interface StudyCardContentProps {
  itemType: 'kanji' | 'vocab';
  itemId: string;
  kanjiMaster: Record<string, KanjiEntry>;
  vocabMaster: Record<string, VocabEntry>;
  isBack: boolean;
}

export const StudyCardContent: React.FC<StudyCardContentProps> = ({ 
  itemType, 
  itemId, 
  kanjiMaster, 
  vocabMaster,
  isBack
}) => {
  if (itemType === 'kanji') {
    const kanjiEntry = kanjiMaster[itemId];
    if (!kanjiEntry) return <div>Không tìm thấy Kanji</div>;
    
    if (!isBack) {
      return <span className="text-6xl font-bold">{kanjiEntry.kanji}</span>;
    }

    return (
      <div className="text-center h-full flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-2">{kanjiEntry.meaning}</h2>
        <p className="mb-1 text-lg">Hán Việt: {kanjiEntry.hanViet}</p>
        <p className="mb-4 text-sm">On: {kanjiEntry.onyomi} | Kun: {kanjiEntry.kunyomi}</p>
        {kanjiEntry.examples && kanjiEntry.examples.length > 0 && (
          <div className="text-sm mt-4 p-2 bg-card/20 rounded">
            <p className="font-bold mb-1">Ví dụ:</p>
            {kanjiEntry.examples.map((ex, i) => <p key={i}>{ex}</p>)}
          </div>
        )}
      </div>
    );
  } else if (itemType === 'vocab') {
    const vocabEntry = vocabMaster[itemId];
    if (!vocabEntry) return <div>Không tìm thấy Từ vựng</div>;

    if (!isBack) {
      return <span className="text-5xl font-bold">{vocabEntry.word}</span>;
    }

    return (
      <div className="text-center h-full flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-2">{vocabEntry.meaning}</h2>
        <p className="mb-4 text-lg">Cách đọc: {vocabEntry.reading}</p>
        {vocabEntry.examples && vocabEntry.examples.length > 0 && (
          <div className="text-sm mt-4 p-2 bg-card/20 rounded">
            <p className="font-bold mb-1">Ví dụ:</p>
            {vocabEntry.examples.map((ex, i) => <p key={i}>{ex}</p>)}
          </div>
        )}
        {vocabEntry.kanjiIds && vocabEntry.kanjiIds.length > 0 && (
          <div className="text-xs mt-4 opacity-70">
            Kanji: {vocabEntry.kanjiIds.map(id => kanjiMaster[id]?.kanji).join(', ')}
          </div>
        )}
      </div>
    );
  }

  return <div>Unknown Card Type</div>;
};
