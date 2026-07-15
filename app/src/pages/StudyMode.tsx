import React, { useState, useMemo } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { CardFlip } from '../components/ui/CardFlip';
import { calculateSM2, isCardDue } from '../utils/sm2';
import { StudyCardContent } from '../components/study/StudyCardContent';
import { StudyControls } from '../components/study/StudyControls';

export const StudyMode: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
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
    return <div className="p-6">Không tìm thấy bộ thẻ</div>;
  }

  if (cardsToStudy.length === 0) {
    return (
      <div className="p-6 text-center max-w-lg mx-auto mt-12 bg-card text-card-foreground rounded-lg border shadow-sm">
        <h2 className="text-2xl mb-4 font-bold">Hoàn thành!</h2>
        <p className="mb-6 text-muted-foreground">Không còn thẻ nào tới hạn trong hôm nay. Bạn đã làm rất tốt!</p>
        <Link to="/" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  if (currentCardIndex >= cardsToStudy.length) {
    return (
      <div className="p-6 text-center max-w-lg mx-auto mt-12 bg-card text-card-foreground rounded-lg border shadow-sm">
        <h2 className="text-2xl mb-4 font-bold">Xong phiên học!</h2>
        <p className="mb-6 text-muted-foreground">Bạn đã học xong {cardsToStudy.length} thẻ.</p>
        <Link to="/" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const currentCardRef = cardsToStudy[currentCardIndex];

  const handleRating = (rating: 1 | 2 | 3 | 4) => {
    const updatedSrsData = calculateSM2(rating, currentCardRef.srsData);
    
    // Update card in the deck
    const updatedCards = deck.cards.map(card => {
      if (card.itemType === currentCardRef.itemType && card.itemId === currentCardRef.itemId) {
        return { ...card, srsData: updatedSrsData };
      }
      return card;
    });

    updateDeck(deck.deckId, { cards: updatedCards });

    // Move to next card
    setIsFlipped(false);
    // Add small delay to let flip animation finish before changing content
    setTimeout(() => {
      setCurrentCardIndex(prev => prev + 1);
    }, 150);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Trở về
        </button>
        <div className="text-sm text-muted-foreground">
          Thẻ {currentCardIndex + 1} / {cardsToStudy.length}
        </div>
      </div>

      <div className="w-full h-80 max-w-md flex justify-center mt-6">
        <CardFlip 
          isFlipped={isFlipped}
          onFlip={(flipped) => {
            if (!isFlipped) setIsFlipped(true);
          }}
          frontContent={
            <div className="w-full h-full flex flex-col justify-center items-center">
              <StudyCardContent 
                itemType={currentCardRef.itemType}
                itemId={currentCardRef.itemId}
                kanjiMaster={kanjiMaster}
                vocabMaster={vocabMaster}
                isBack={false}
              />
            </div>
          }
          backContent={
            <div className="w-full h-full flex flex-col justify-center items-center overflow-y-auto">
              <StudyCardContent 
                itemType={currentCardRef.itemType}
                itemId={currentCardRef.itemId}
                kanjiMaster={kanjiMaster}
                vocabMaster={vocabMaster}
                isBack={true}
              />
            </div>
          }
        />
      </div>

      {isFlipped ? (
        <StudyControls 
          currentSrsData={currentCardRef.srsData}
          onRate={handleRating}
        />
      ) : (
        <div className="mt-6 text-muted-foreground text-sm animate-pulse">
          Nhấn vào thẻ để lật
        </div>
      )}
    </div>
  );
};
