import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { analyzeJapaneseText, initKuromoji } from '../../services/kuromojiService';

const POS_MAP: Record<string, string> = {
  '名詞': 'Danh từ',
  '動詞': 'Động từ',
  '形容詞': 'Tính từ',
  '助詞': 'Trợ từ',
  '助動詞': 'Trợ động từ',
  '副詞': 'Phó từ',
  '連体詞': 'Liên thể từ',
  '接続詞': 'Liên từ',
  '感動詞': 'Thán từ',
  '接頭詞': 'Tiền tố',
  'フィラー': 'Từ đệm',
  'その他': 'Khác',
  '記号': 'Ký hiệu',
  '未知語': 'Chưa rõ'
};

export const SentenceParser: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [tokens, setTokens] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isDictLoaded, setIsDictLoaded] = useState(false);
  const [isDictLoading, setIsDictLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingFile, setLoadingFile] = useState('');
  const { kanjiMaster, vocabMaster } = useAppStore();

  useEffect(() => {
    // Tự động tải từ điển khi vào trang
    handleLoadDictionary();
  }, []);

  const handleLoadDictionary = async () => {
    if (isDictLoaded || isDictLoading) return;
    setIsDictLoading(true);
    setLoadProgress(0);
    try {
      await initKuromoji((loaded, total, filename) => {
        const progress = Math.min(100, Math.round((loaded / total) * 100));
        setLoadProgress(progress);
        if (filename && filename !== 'Loaded') {
          setLoadingFile(filename);
        }
      });
      setIsDictLoaded(true);
    } catch (err: any) {
      console.error("Kuromoji load error:", err);
      alert(`Failed to load dictionary. Error: ${err.message}`);
    } finally {
      setIsDictLoading(false);
    }
  };

  const handleParse = async () => {
    if (!inputText.trim()) return;
    
    setIsParsing(true);
    try {
      const parsedTokens = await analyzeJapaneseText(inputText);
      setTokens(parsedTokens);
    } catch (err: any) {
      console.error("Kuromoji parsing error:", err);
      alert(`Failed to parse text. Error: ${err.message || String(err)}\nPlease ensure the dictionary is loaded correctly.`);
    } finally {
      setIsParsing(false);
    }
  };

  const renderTokenTooltip = (token: any) => {
    const word = token.surface_form;
    const pos = POS_MAP[token.pos] || token.pos;
    
    const vocabEntry = Object.values(vocabMaster).find(v => v.word === word);
    if (vocabEntry) {
      return (
        <div className="absolute z-10 hidden group-hover:block bg-popover text-popover-foreground p-3 rounded-md shadow-md text-sm bottom-full mb-2 w-48 border">
          <p className="font-bold">{vocabEntry.word} ({vocabEntry.reading})</p>
          <p className="text-xs text-muted-foreground mb-1">{pos}</p>
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
      <div className="absolute z-10 hidden group-hover:flex flex-col gap-2 bg-card text-card-foreground p-3 rounded-md shadow-md text-sm bottom-full mb-2 w-48 border">
        <p className="font-bold">{token.surface_form}</p>
        <p className="text-xs text-muted-foreground mb-2">Từ loại: {pos}</p>
        <button className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs hover:bg-primary/90">Lưu từ vựng</button>
        <button className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs hover:bg-secondary/90">Lưu Kanji</button>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <textarea
        className="w-full h-32 p-3 border rounded-md bg-input text-foreground mb-4"
        placeholder="Nhập câu tiếng Nhật vào đây..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      
      {!isDictLoaded ? (
        <button 
          className="bg-primary text-primary-foreground px-4 py-3 rounded-md mb-6 disabled:opacity-80 flex flex-col items-center justify-center min-w-64"
          disabled={true}
        >
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2 font-medium">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground border-t-transparent"></span>
              <span>Đang tải từ điển... {loadProgress}%</span>
            </div>
            <div className="w-full bg-primary-foreground/20 rounded-full h-1.5 mb-1 overflow-hidden">
              <div className="bg-primary-foreground h-1.5 rounded-full transition-all duration-300" style={{ width: `${loadProgress}%` }}></div>
            </div>
            <span className="text-[10px] opacity-70 truncate max-w-full">File: {loadingFile}</span>
          </div>
        </button>
      ) : (
        <button 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md mb-6 disabled:opacity-50 flex items-center gap-2"
          onClick={handleParse}
          disabled={isParsing || !inputText.trim()}
        >
          {isParsing ? 'Đang phân tích...' : 'Phân tích (Parse)'}
        </button>
      )}

      <div className="flex flex-wrap gap-y-4 gap-x-1 text-xl leading-loose mt-4">
        {tokens.map((token, index) => {
          const isKnown = Object.values(vocabMaster).some(v => v.word === token.surface_form);
          const posVi = POS_MAP[token.pos] || token.pos;
          return (
            <div key={index} className="relative group inline-block cursor-pointer">
              <ruby className={`px-1 py-1 rounded ${isKnown ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 underline decoration-dotted' : 'hover:bg-accent'}`}>
                {token.surface_form}
                <rt className="text-[10px] text-muted-foreground tracking-tighter">{posVi}</rt>
              </ruby>
              {renderTokenTooltip(token)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
