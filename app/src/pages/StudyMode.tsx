import React, { useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { CardFlip } from '../components/ui/CardFlip';
import { calculateSM2, isCardDue } from '../utils/sm2';

export const StudyMode: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'normal'; // 'normal' or 'cram'
  const { decks, kanjiMaster, vocabMaster, updateDeck } = useAppStore();
  const deck = decks.find(d => d.deckId === deckId);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cardsToStudy = useMemo(() => {
    if (!deck) return [];
    if (mode === 'normal') {
      return deck.cards.filter(card => isCardDue(card.srsData));
    }
    return deck.cards;
  }, [deck, mode]);

  if (!deck) {
    return <div className="p-6">Deck not found</div>;
  }

  if (cardsToStudy.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl mb-4">No cards due for study!</h2>
        <Link to="/" className="text-primary hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const currentCardRef = cardsToStudy[currentCardIndex];
  
  // Resolve card content
  let frontContent: React.ReactNode = 'Unknown';
  let backContent: React.ReactNode = 'Unknown';

  if (currentCardRef.itemType === 'kanji') {
    const kanjiEntry = kanjiMaster[currentCardRef.itemId];
    if (kanjiEntry) {
      frontContent = kanjiEntry.kanji;
      backContent = (
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
    }
  } else if (currentCardRef.itemType === 'vocab') {
    const vocabEntry = vocabMaster[currentCardRef.itemId];
    if (vocabEntry) {
      frontContent = vocabEntry.word;
      backContent = (
        <div className="text-center h-full flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">{vocabEntry.meaning}</h2>
          <p className="mb-4 text-lg">Reading: {vocabEntry.reading}</p>
          {vocabEntry.examples && vocabEntry.examples.length > 0 && (
            <div className="text-sm mt-4 p-2 bg-card/20 rounded">
              <p className="font-bold mb-1">Ví dụ:</p>
              {vocabEntry.examples.map((ex, i) => <p key={i}>{ex}</p>)}
            </div>
          )}
        </div>
      );
    }
  } else if (currentCardRef.itemType === 'sentence' || currentCardRef.itemType === 'paragraph') {
    frontContent = <div className="text-lg">{currentCardRef.customFront}</div>;
    backContent = <div className="text-lg">{currentCardRef.customBack}</div>;
  }

  const handleRating = async (rating: 1 | 2 | 3 | 4) => {
    const updatedSrsData = calculateSM2(rating, currentCardRef.srsData);

    const updatedCards = deck.cards.map(c => 
      c.itemId === currentCardRef.itemId && c.itemType === currentCardRef.itemType 
        ? { ...c, srsData: updatedSrsData } 
        : c
    );

    const updatedDeck = { ...deck, cards: updatedCards, lastStudied: new Date().toISOString() };
    await updateDeck(updatedDeck);

    setIsFlipped(false);
    setTimeout(() => {
      if (currentCardIndex < cardsToStudy.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        alert("Deck finished!");
      }
    }, 150);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-12">
        <Link to="/" className="text-muted-foreground hover:text-foreground">&larr; Back</Link>
        <div className="font-bold text-muted-foreground flex flex-col items-end">
          <span>{currentCardIndex + 1} / {cardsToStudy.length}</span>
          <span className="text-xs uppercase bg-secondary text-secondary-foreground px-2 py-0.5 rounded mt-1">{mode} MODE</span>
        </div>
      </div>

      <CardFlip 
        frontContent={frontContent} 
        backContent={backContent} 
        isFlipped={isFlipped}
        onFlip={setIsFlipped}
      />

      <div className="mt-12 w-full max-w-md flex justify-center h-16">
        {isFlipped ? (
          <div className="flex gap-4 w-full">
            <button onClick={() => handleRating(1)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded font-bold">Again (1)</button>
            <button onClick={() => handleRating(2)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold">Hard (2)</button>
            <button onClick={() => handleRating(3)} className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded font-bold">Good (3)</button>
            <button onClick={() => handleRating(4)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold">Easy (4)</button>
          </div>
        ) : (
          <p className="text-muted-foreground">Click card or press Space to show answer</p>
        )}
      </div>
    </div>
  );
};
