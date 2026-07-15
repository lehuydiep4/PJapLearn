import { SRSData } from '../types';

/**
 * SuperMemo-2 (SM-2) Algorithm Implementation
 * 
 * Maps our 4-button system to SM-2 qualities:
 * 1 (Again) -> Quality 0 (Complete blackout - reset repetition)
 * 2 (Hard)  -> Quality 3 (Correct but serious difficulty)
 * 3 (Good)  -> Quality 4 (Correct after hesitation)
 * 4 (Easy)  -> Quality 5 (Perfect response)
 * 
 * @param quality 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 * @param currentData Current SRSData of the card
 * @returns Updated SRSData
 */
export function calculateSM2(rating: 1 | 2 | 3 | 4, currentData: SRSData): SRSData {
  let quality = 0;
  switch (rating) {
    case 1: quality = 0; break; // Again
    case 2: quality = 3; break; // Hard
    case 3: quality = 4; break; // Good
    case 4: quality = 5; break; // Easy
  }

  let { interval, repetition, easeFactor } = currentData;

  if (quality >= 3) {
    // Correct response
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition++;
  } else {
    // Incorrect response
    repetition = 0;
    interval = 0; // 0 means 10 minutes
  }

  // Calculate new ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Calculate next review date
  const nextDate = new Date();
  if (interval === 0) {
    // 10 minutes from now
    nextDate.setMinutes(nextDate.getMinutes() + 10);
  } else {
    nextDate.setDate(nextDate.getDate() + interval);
    // Set to start of the day to avoid time-of-day strictness
    nextDate.setHours(0, 0, 0, 0);
  }

  return {
    interval,
    repetition,
    easeFactor,
    nextReviewDate: nextDate.toISOString()
  };
}

/**
 * Utility to check if a card is due for review today
 */
export function isCardDue(srsData: SRSData): boolean {
  const now = new Date();
  const nextReview = new Date(srsData.nextReviewDate);
  return nextReview <= now;
}

/**
 * Creates a default SRSData for a new card
 */
export function createDefaultSRSData(): SRSData {
  // New card is due immediately
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return {
    interval: 0,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: now.toISOString()
  };
}
