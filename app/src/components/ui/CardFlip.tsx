import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CardFlipProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
}

export const CardFlip: React.FC<CardFlipProps> = ({ frontContent, backContent, isFlipped: controlledIsFlipped, onFlip }) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledIsFlipped !== undefined ? controlledIsFlipped : internalFlipped;

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setInternalFlipped(newFlipped);
    if (onFlip) {
      onFlip(newFlipped);
    }
  };

  return (
    <div className="relative w-80 h-96 cursor-pointer perspective-1000" onClick={handleFlip}>
      <motion.div
        className="w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-card text-card-foreground shadow-lg rounded-xl flex items-center justify-center p-6 border">
          <div className="text-3xl font-bold text-center">{frontContent}</div>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden bg-primary text-primary-foreground shadow-lg rounded-xl flex flex-col p-6 border"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};
