import kuromoji from 'kuromoji';

let tokenizerInstance: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

export const initKuromoji = (): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> => {
  return new Promise((resolve, reject) => {
    if (tokenizerInstance) {
      resolve(tokenizerInstance);
      return;
    }
    kuromoji.builder({ dicPath: '/dict/' }).build((err, tokenizer) => {
      if (err) {
        console.error("Failed to build kuromoji tokenizer:", err);
        reject(err);
        return;
      }
      tokenizerInstance = tokenizer;
      resolve(tokenizer);
    });
  });
};

/**
 * Tokenizes Japanese text and returns detailed grammatical features (pos, reading, base form).
 */
export const analyzeJapaneseText = async (text: string) => {
  const tokenizer = await initKuromoji();
  return tokenizer.tokenize(text);
};
