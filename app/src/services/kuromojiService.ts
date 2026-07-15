import kuromoji from 'kuromoji';

let tokenizerInstance: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

export const initKuromoji = (onProgress?: (loaded: number, total: number, filename: string) => void): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> => {
  return new Promise((resolve, reject) => {
    if (tokenizerInstance) {
      if (onProgress) onProgress(100, 100, "Loaded");
      resolve(tokenizerInstance);
      return;
    }
    
    // Intercept XHR to report progress for dictionary files
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    const fileProgress: Record<string, number> = {};
    const TOTAL_BYTES = 17791956; // approx 17.7MB
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (typeof url === 'string' && url.includes('/dict/') && url.endsWith('.gz')) {
         url = url + '?v=' + Date.now();
      }
      (this as any)._url = url;
      return originalOpen.call(this, method, url, ...args);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
      const url = (this as any)._url;
      if (url && typeof url === 'string' && url.includes('/dict/')) {
        let filename = url.split('/').pop() || 'file';
        filename = filename.split('?')[0];
        this.addEventListener('progress', (e) => {
          if (e.loaded) {
            fileProgress[filename] = e.loaded;
            const totalLoaded = Object.values(fileProgress).reduce((acc, val) => acc + val, 0);
            if (onProgress) {
              onProgress(totalLoaded, TOTAL_BYTES, filename);
            }
          }
        });
      }
      return originalSend.call(this, ...args);
    };

    try {
      kuromoji.builder({ dicPath: '/dict/' }).build((err, tokenizer) => {
        // Restore original XHR
        XMLHttpRequest.prototype.open = originalOpen;
        XMLHttpRequest.prototype.send = originalSend;

        if (err) {
          console.error("Failed to build kuromoji tokenizer:", err);
          reject(new Error(`Kuromoji load error: ${err.message || String(err)}`));
          return;
        }
        tokenizerInstance = tokenizer;
        resolve(tokenizer);
      });
    } catch (e: any) {
      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;
      console.error("Kuromoji sync error:", e);
      reject(new Error(`Kuromoji init error: ${e.message || String(e)}`));
    }
  });
};

/**
 * Tokenizes Japanese text and returns detailed grammatical features (pos, reading, base form).
 */
export const analyzeJapaneseText = async (text: string) => {
  const tokenizer = await initKuromoji();
  return tokenizer.tokenize(text);
};
