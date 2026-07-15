import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { isCardDue } from '../utils/sm2';

export const Dashboard: React.FC = () => {
  const { decks } = useAppStore();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bộ thẻ của bạn</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map(deck => {
          const dueCount = deck.cards.filter(c => isCardDue(c.srsData)).length;
          const newCount = deck.cards.filter(c => c.srsData.repetition === 0).length;

          return (
            <div key={deck.deckId} className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border flex flex-col h-full">
              <h2 className="text-xl font-bold mb-2">{deck.deckName}</h2>
              <p className="text-muted-foreground text-sm mb-4">{deck.description}</p>
              
              <div className="flex justify-between text-sm mb-6 flex-grow">
                <div>
                  <span className="block font-semibold">Tổng số</span>
                  <span className="text-muted-foreground">{deck.cards.length} thẻ</span>
                </div>
                <div>
                  <span className="block font-semibold text-green-600 dark:text-green-400">Đến hạn</span>
                  <span>{dueCount}</span>
                </div>
                <div>
                  <span className="block font-semibold text-blue-600 dark:text-blue-400">Mới</span>
                  <span>{newCount}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <Link 
                  to={`/study/${deck.deckId}?mode=normal`}
                  className={`flex-1 text-center py-2 rounded-md transition-colors ${
                    dueCount > 0 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-muted text-muted-foreground pointer-events-none'
                  }`}
                >
                  Học bài ({dueCount})
                </Link>
                <Link 
                  to={`/study/${deck.deckId}?mode=cram`}
                  className="flex-1 bg-secondary text-secondary-foreground text-center py-2 rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Học nhanh (Cram)
                </Link>
              </div>
            </div>
          );
        })}

        {decks.length === 0 && (
          <div className="col-span-full text-center p-12 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground mb-4">Bạn chưa có bộ thẻ nào.</p>
            <p className="text-sm">Hãy vào cài đặt và nhấp "Import Deck" để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
};
