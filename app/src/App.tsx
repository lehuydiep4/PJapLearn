import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { StudyMode } from "./pages/StudyMode";
import { SentenceParser } from "./components/parser/SentenceParser";
import { ParagraphReader } from "./components/parser/ParagraphReader";
import { Layout } from "./components/Layout";
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
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="study/:deckId" element={<StudyMode />} />
          <Route path="parse-sentence" element={<SentenceParser />} />
          <Route path="read-paragraph" element={<ParagraphReader />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
