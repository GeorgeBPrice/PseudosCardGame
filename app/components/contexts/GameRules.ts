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

// Add the Play type definition
export type Play = {
  type: 'single' | 'pair' | 'triple' | 'straight' | 'fullhouse' | 'quads' | 'straightflush'; // Expand as needed
  cards: CardType[];
  rankValue: number; // Value of the highest card or primary component (e.g., triple in full house)
  highestSuitValue?: number; // Optional: for tie-breaking (e.g., highest suit in pair)
};

// Add the getPlayInfo function definition
export const getPlayInfo = (cards: CardType[]): Play | null => {
  if (!cards || cards.length === 0) return null;

  const n = cards.length;
  // Ensure consistent sorting for comparisons and value extraction
  const sortedCards = [...cards].sort((a, b) => cardValues[a.value] - cardValues[b.value] || suitValues[a.suit] - suitValues[b.suit]);
  const highestCard = sortedCards[n - 1];
  const highestRankValue = cardValues[highestCard.value];
  const highestSuitValue = suitValues[highestCard.suit];

  // --- Single ---
  if (n === 1) {
    return { type: 'single', cards: sortedCards, rankValue: highestRankValue, highestSuitValue: highestSuitValue };
  }

  // --- Pair ---
  if (n === 2) {
    if (sortedCards[0].value === sortedCards[1].value) {
      return { type: 'pair', cards: sortedCards, rankValue: highestRankValue, highestSuitValue: Math.max(suitValues[sortedCards[0].suit], suitValues[sortedCards[1].suit]) };
    }
    return null;
  }

  // --- Triple --- (Add check for completeness, even if not played alone)
   if (n === 3) {
     if (sortedCards[0].value === sortedCards[1].value && sortedCards[1].value === sortedCards[2].value) {
       return { type: 'triple', cards: sortedCards, rankValue: highestRankValue };
     }
     return null;
   }

  // --- Five Card Hands ---
  if (n === 5) {
    const isStraightCheck = isValidStraight(sortedCards);
    const isTriplePlusTwoCheck = isValidTriplePlusTwo(sortedCards); // Assumes this checks for exactly 3 of one kind and 2 of another (or 3+any 2)

    // Prioritize higher-ranked 5-card hands if rules define them (e.g., Straight Flush > Quads > Full House > Flush > Straight)
    // For now, just check Straight and Full House based on existing helpers

    if (isStraightCheck) {
        const uniqueRanks = Array.from(new Set(sortedCards.map(c => cardValues[c.value]))).sort((a,b)=>a-b);
        const isAceLow = uniqueRanks.length === 5 && uniqueRanks.join(',') === '2,3,4,5,14';
        const rankVal = isAceLow ? 5 : highestRankValue; // Use 5 for A-low straight rank
        // Ensure it's *only* a straight, not potentially a straight flush if suits match (add flush check if needed later)
        return { type: 'straight', cards: sortedCards, rankValue: rankVal, highestSuitValue: getHighestSuitInStraight(sortedCards) };
    }

    if (isTriplePlusTwoCheck) {
        // Find the triple's value for ranking
        const valueCounts: Record<string, number> = {};
        sortedCards.forEach(card => { valueCounts[card.value] = (valueCounts[card.value] || 0) + 1; });
        const tripleValueStr = Object.entries(valueCounts).find(([_, count]) => count === 3)?.[0];
        const tripleRankValue = tripleValueStr ? cardValues[tripleValueStr] : 0;
        // Ensure it's not also a straight (e.g. 3,3,3,4,5 - unlikely based on card limits but good practice)
        if (!isStraightCheck) {
             return { type: 'fullhouse', cards: sortedCards, rankValue: tripleRankValue };
        }
    }
  }

  // TODO: Add checks for Quads (4 cards) if they are a valid play type

  return null; // Return null if no valid known play type matches
};

/**
 * Check if the given 5 cards form a valid straight
 * Accounts for pairs within the sequence (e.g., 4, 5, 5, 6, 7 is a 7-high straight)
 * Aces can be high or low (A,2,3,4,5 or 10,J,Q,K,A)
 */
export const isValidStraight = (cards: CardType[]): boolean => {
  if (cards.length !== 5) return false;

  const rankValues = cards.map(card => cardValues[card.value]);
  const uniqueRanks = Array.from(new Set(rankValues)).sort((a, b) => a - b);

  // Need at least 5 unique ranks OR the specific A-2-3-4-5 case for wrap-around
  if (uniqueRanks.length < 5) {
      // Check for A-2-3-4-5 (where unique ranks are 2, 3, 4, 5, 14)
       const isAceLow = uniqueRanks.length === 5 && 
                        uniqueRanks[0] === 2 && 
                        uniqueRanks[1] === 3 && 
                        uniqueRanks[2] === 4 && 
                        uniqueRanks[3] === 5 && 
                        uniqueRanks[4] === 14; // Ace
       if (!isAceLow) return false;
       // If it is Ace low, it's a valid straight
       return true; 
  }

  // Check if the 5 unique ranks are consecutive
  let isConsecutive = true;
  for (let i = 1; i < uniqueRanks.length; i++) {
    if (uniqueRanks[i] !== uniqueRanks[i - 1] + 1) {
      isConsecutive = false;
      break;
    }
  }
  
  // Check for A-2-3-4-5 again (if ranks were originally 2,3,4,5,A)
  const isAceLow = uniqueRanks.length === 5 && 
                   uniqueRanks[0] === 2 && uniqueRanks[1] === 3 && uniqueRanks[2] === 4 && 
                   uniqueRanks[3] === 5 && uniqueRanks[4] === 14; // Ace

  // A straight is valid if the 5 unique ranks are consecutive OR it's the A-low special case
  return isConsecutive || isAceLow;
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