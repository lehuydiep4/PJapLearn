import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { isCardDue } from '../utils/sm2';
import { ImportModal } from '../components/ImportModal';

export const Dashboard: React.FC = () => {
  const { decks } = useAppStore();
  const [showImportModal, setShowImportModal] = useState(false);

  // Calculate total due cards across all decks
  const totalDueCards = decks.reduce((acc, deck) => {
    return acc + deck.cards.filter(c => isCardDue(c.srsData)).length;
  }, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Decks</h1>
        <div className="flex gap-4">
          <Link to="/parse-sentence" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80">
            Import Sentence
          </Link>
          <Link to="/read-paragraph" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80">
            Read Paragraph
          </Link>
          <button 
            onClick={() => setShowImportModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Import CSV
          </button>
        </div>
      </div>

      <div className="mb-8 p-6 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Today's Learning Queue</h2>
          <p className="text-muted-foreground">You have {totalDueCards} cards due for review today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map(deck => {
          const dueCardsCount = deck.cards.filter(c => isCardDue(c.srsData)).length;
          const totalCardsCount = deck.cards.length;

          return (
            <div 
              key={deck.deckId} 
              className="block p-6 bg-card text-card-foreground border rounded-lg shadow-sm relative flex flex-col"
            >
              <h2 className="text-xl font-bold mb-2">{deck.deckName}</h2>
              <p className="text-muted-foreground mb-4 flex-grow">{deck.description || 'No description'}</p>
              
              <div className="flex justify-between items-center mb-4 text-sm font-medium">
                <span className={dueCardsCount > 0 ? "text-destructive" : "text-green-500"}>
                  {dueCardsCount} due
                </span>
                <span className="text-muted-foreground">{totalCardsCount} total</span>
              </div>

              <div className="flex flex-col gap-2">
                <Link 
                  to={`/study/${deck.deckId}?mode=normal`}
                  className={`text-center py-2 rounded-md font-medium transition-colors ${
                    dueCardsCount > 0 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
                  }`}
                >
                  Study Normal
                </Link>
                <Link 
                  to={`/study/${deck.deckId}?mode=cram`}
                  className="text-center py-2 rounded-md font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cram (Study All)
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
};
