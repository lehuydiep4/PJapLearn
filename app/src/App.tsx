import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { StudyMode } from "./pages/StudyMode";
import { SentenceParser } from "./components/parser/SentenceParser";
import { ParagraphReader } from "./components/parser/ParagraphReader";
import { useAppStore } from "./store/appStore";

// Mock Data imports
import mockKanjiMaster from "./mocks/kanji_master.json";
import mockVocabMaster from "./mocks/vocab_master.json";
import mockDeck from "./mocks/deck_mock.json";

function App() {
  const { isInitialized, initializeApp } = useAppStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeApp({
        kanji: mockKanjiMaster as any,
        vocab: mockVocabMaster as any,
        deck: mockDeck as any
      });
    }
  }, [isInitialized, initializeApp]);

  if (!isInitialized) {
    return <div className="min-h-screen flex items-center justify-center">Loading Data...</div>;
  }

  return (
    <BrowserRouter>
      <main className="min-h-screen bg-background text-foreground font-sans">
        <header className="border-b p-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-primary">MemoriAI</h1>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/study/:deckId" element={<StudyMode />} />
          <Route path="/parse-sentence" element={<SentenceParser />} />
          <Route path="/read-paragraph" element={<ParagraphReader />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
