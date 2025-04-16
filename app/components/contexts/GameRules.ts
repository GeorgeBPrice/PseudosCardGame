/**
 * Game rules and utilities for the card game.
 * Provides logic to validate card combinations and compare moves.
 * 
 * @module GameRules
 * 
 * @typedef {Object} CardType
 * @property {number} id - Unique identifier for the card
 * @property {string} value - Card value (2-10, J, Q, K, A)
 * @property {string} suit - Card suit (♠, ♣, ♦, ♥)
 * 
 * @function isValidStraight
 * @param {CardType[]} cards - Array of 5 cards to check
 * @returns {boolean} True if cards form a valid straight, false otherwise
 */

export type CardType = {
  id: number;
  value: string;
  suit: string;
};

// Card values and suit values
export const cardValues: Record<string, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14
};

export const suitValues: Record<string, number> = {
  "♠": 1, "♣": 2, "♦": 3, "♥": 4
};

/**
 * Check if the given 5 cards form a valid straight
 * Aces are always high in straights (10,J,Q,K,A)
 */
export const isValidStraight = (cards: CardType[]): boolean => {
  if (cards.length !== 5) return false;
  
  // Sort cards by value, treating Aces as highest
  const sortedCards = [...cards].sort((a, b) => {
    const aValue = a.value === 'A' ? 14 : cardValues[a.value];
    const bValue = b.value === 'A' ? 14 : cardValues[b.value];
    return aValue - bValue;
  });
  
  // Special case for A-high straight (10,J,Q,K,A)
  if (sortedCards[0].value === '10' && 
      sortedCards[1].value === 'J' && 
      sortedCards[2].value === 'Q' && 
      sortedCards[3].value === 'K' && 
      sortedCards[4].value === 'A') {
    return true;
  }
  
  // Check if values are consecutive
  for (let i = 1; i < sortedCards.length; i++) {
    const prevValue = sortedCards[i-1].value === 'A' ? 14 : cardValues[sortedCards[i-1].value];
    const currValue = sortedCards[i].value === 'A' ? 14 : cardValues[sortedCards[i].value];
    if (currValue !== prevValue + 1) {
      return false;
    }
  }
  
  return true;
};

/**
 * Check if the given 5 cards form a valid triple + 2 random cards combination
 */
export const isValidTriplePlusTwo = (cards: CardType[]): boolean => {
  if (cards.length !== 5) return false;
  
  // Count occurrences of each value
  const valueCounts: Record<string, number> = {};
  cards.forEach(card => {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  });
  
  // Check if there's a value that appears 3 times
  return Object.values(valueCounts).some(count => count === 3);
};

/**
 * Get the highest suit in a straight for tie-breaking
 */
export const getHighestSuitInStraight = (cards: CardType[]): number => {
  // Sort cards by value and suit
  const sortedCards = [...cards].sort((a, b) => {
    const aValue = a.value === 'A' ? 14 : cardValues[a.value];
    const bValue = b.value === 'A' ? 14 : cardValues[b.value];
    if (aValue !== bValue) return bValue - aValue;
    return suitValues[b.suit] - suitValues[a.suit];
  });
  
  return suitValues[sortedCards[0].suit];
};

/**
 * Compare two 5-card combinations to determine if the new one beats the last one
 */
export const compareFiveCardCombinations = (newCards: CardType[], lastCards: CardType[]): boolean => {
  const isNewStraight = isValidStraight(newCards);
  const isLastStraight = isValidStraight(lastCards);
  
  // Straight always beats triple + 2
  if (isNewStraight && !isLastStraight) return true;
  if (!isNewStraight && isLastStraight) return false;
  
  if (isNewStraight && isLastStraight) {
    // Compare highest card in straights
    const newHighest = Math.max(...newCards.map(c => c.value === 'A' ? 14 : cardValues[c.value]));
    const lastHighest = Math.max(...lastCards.map(c => c.value === 'A' ? 14 : cardValues[c.value]));
    
    if (newHighest > lastHighest) return true;
    if (newHighest < lastHighest) return false;
    
    // If highest cards are equal, compare suits
    return getHighestSuitInStraight(newCards) > getHighestSuitInStraight(lastCards);
  }
  
  // Both are triple + 2, compare the triple values
  const getTripleValue = (cards: CardType[]): number => {
    const valueCounts: Record<string, number> = {};
    cards.forEach(card => {
      valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
    });
    const tripleValue = Object.entries(valueCounts).find(([_, count]) => count === 3)?.[0];
    return tripleValue ? (tripleValue === 'A' ? 14 : cardValues[tripleValue]) : 0;
  };
  
  const newTripleValue = getTripleValue(newCards);
  const lastTripleValue = getTripleValue(lastCards);
  
  // For triple + 2, only compare the triple values
  return newTripleValue > lastTripleValue;
};

/**
 * Compare two moves to determine if the new one beats the last one
 */
export const isValidMove = (newCards: CardType[], lastCards: CardType[]): boolean => {
  if (!newCards.length || !lastCards.length) return false;
  
  // Single card comparison
  if (newCards.length === 1 && lastCards.length === 1) {
    const newCard = newCards[0];
    const lastCard = lastCards[0];
    const newValue = newCard.value === 'A' ? 14 : cardValues[newCard.value];
    const lastValue = lastCard.value === 'A' ? 14 : cardValues[lastCard.value];
    
    if (newValue > lastValue) return true;
    if (newValue === lastValue) {
      return suitValues[newCard.suit] > suitValues[lastCard.suit];
    }
    return false;
  }
  
  // Double card comparison
  if (newCards.length === 2 && lastCards.length === 2) {
    const [new1, new2] = newCards;
    const [last1, last2] = lastCards;
    
    if (new1.value !== new2.value || last1.value !== last2.value) return false;
    
    const newValue = new1.value === 'A' ? 14 : cardValues[new1.value];
    const lastValue = last1.value === 'A' ? 14 : cardValues[last1.value];
    
    if (newValue > lastValue) return true;
    if (newValue === lastValue) {
      const newMaxSuit = Math.max(suitValues[new1.suit], suitValues[new2.suit]);
      const lastMaxSuit = Math.max(suitValues[last1.suit], suitValues[last2.suit]);
      return newMaxSuit > lastMaxSuit;
    }
    return false;
  }
  
  // Five card comparison
  if (newCards.length === 5 && lastCards.length === 5) {
    return compareFiveCardCombinations(newCards, lastCards);
  }
  
  return false;
}; 