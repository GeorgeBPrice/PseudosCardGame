/**
 * Test suite for game rules and card validation logic
 * Tests various card combinations and move validations including:
 * - Single card plays (comparing values and suits)
 * - Double card plays (pairs)
 * - Straight combinations
 * - Triple plus two combinations
 * - Move validation between different combinations
 * 
 * Uses helper function createCard() to generate test card objects
 */

import {
  CardType,
  isValidStraight,
  isValidTriplePlusTwo,
  compareFiveCardCombinations,
  isValidMove
} from '../GameRules';

// Helper function to create cards for testing
const createCard = (value: string, suit: string, id: number): CardType => ({
  id,
  value,
  suit
});

describe('Game Rules Tests', () => {
  describe('Single Card Plays', () => {
    test('allow playing a higher card', () => {
      const lastCard = createCard('5', '♠', 1);
      const newCard = createCard('7', '♠', 2);
      expect(isValidMove([newCard], [lastCard])).toBe(true);
    });

    test('allow playing same card with higher suit', () => {
      const lastCard = createCard('5', '♠', 1);
      const newCard = createCard('5', '♥', 2);
      expect(isValidMove([newCard], [lastCard])).toBe(true);
    });

    test('should not allow playing lower card', () => {
      const lastCard = createCard('7', '♠', 1);
      const newCard = createCard('5', '♠', 2);
      expect(isValidMove([newCard], [lastCard])).toBe(false);
    });

    test('should not allow playing same card with lower suit', () => {
      const lastCard = createCard('5', '♥', 1);
      const newCard = createCard('5', '♠', 2);
      expect(isValidMove([newCard], [lastCard])).toBe(false);
    });
  });

  describe('Double Card Plays', () => {
    test('allow playing higher double', () => {
      const lastCards = [
        createCard('5', '♠', 1),
        createCard('5', '♣', 2)
      ];
      const newCards = [
        createCard('7', '♠', 3),
        createCard('7', '♣', 4)
      ];
      expect(isValidMove(newCards, lastCards)).toBe(true);
    });

    test('allow playing same double with higher suit', () => {
      const lastCards = [
        createCard('5', '♠', 1),
        createCard('5', '♣', 2)
      ];
      const newCards = [
        createCard('5', '♥', 3),
        createCard('5', '♦', 4)
      ];
      expect(isValidMove(newCards, lastCards)).toBe(true);
    });

    test('should not allow playing lower double', () => {
      const lastCards = [
        createCard('7', '♠', 1),
        createCard('7', '♣', 2)
      ];
      const newCards = [
        createCard('5', '♠', 3),
        createCard('5', '♣', 4)
      ];
      expect(isValidMove(newCards, lastCards)).toBe(false);
    });
  });

  describe('Half House (Triple + 2) Plays', () => {
    test('validate triple + 2 combination', () => {
      const cards = [
        createCard('7', '♠', 1),
        createCard('7', '♣', 2),
        createCard('7', '♥', 3),
        createCard('2', '♠', 4),
        createCard('3', '♠', 5)
      ];
      expect(isValidTriplePlusTwo(cards)).toBe(true);
    });

    test('should not validate invalid triple + 2 combination', () => {
      const cards = [
        createCard('7', '♠', 1),
        createCard('7', '♣', 2),
        createCard('8', '♥', 3),
        createCard('2', '♠', 4),
        createCard('3', '♠', 5)
      ];
      expect(isValidTriplePlusTwo(cards)).toBe(false);
    });

    test('allow playing higher triple + 2', () => {
      const lastCards = [
        createCard('5', '♠', 1),
        createCard('5', '♣', 2),
        createCard('5', '♥', 3),
        createCard('2', '♠', 4),
        createCard('3', '♠', 5)
      ];
      const newCards = [
        createCard('7', '♠', 6),
        createCard('7', '♣', 7),
        createCard('7', '♥', 8),
        createCard('2', '♠', 9),
        createCard('3', '♠', 10)
      ];
      expect(compareFiveCardCombinations(newCards, lastCards)).toBe(true);
    });
  });

  describe('Half Straight Plays', () => {
    test('validate straight combination', () => {
      const cards = [
        createCard('7', '♠', 1),
        createCard('8', '♣', 2),
        createCard('9', '♥', 3),
        createCard('10', '♠', 4),
        createCard('J', '♠', 5)
      ];
      expect(isValidStraight(cards)).toBe(true);
    });

    test('validate A-high straight', () => {
      const cards = [
        createCard('10', '♠', 1),
        createCard('J', '♣', 2),
        createCard('Q', '♥', 3),
        createCard('K', '♠', 4),
        createCard('A', '♠', 5)
      ];
      expect(isValidStraight(cards)).toBe(true);
    });

    test('should not validate invalid straight', () => {
      const cards = [
        createCard('7', '♠', 1),
        createCard('8', '♣', 2),
        createCard('9', '♥', 3),
        createCard('10', '♠', 4),
        createCard('Q', '♠', 5)
      ];
      expect(isValidStraight(cards)).toBe(false);
    });
  });

  describe('Mixed Combinations', () => {
    test('straight should beat triple + 2', () => {
      const tripleCards = [
        createCard('7', '♠', 1),
        createCard('7', '♣', 2),
        createCard('7', '♥', 3),
        createCard('2', '♠', 4),
        createCard('3', '♠', 5)
      ];
      const straightCards = [
        createCard('7', '♠', 6),
        createCard('8', '♣', 7),
        createCard('9', '♥', 8),
        createCard('10', '♠', 9),
        createCard('J', '♠', 10)
      ];
      expect(compareFiveCardCombinations(straightCards, tripleCards)).toBe(true);
    });

    test('triple + 2 should not beat straight', () => {
      const straightCards = [
        createCard('7', '♠', 1),
        createCard('8', '♣', 2),
        createCard('9', '♥', 3),
        createCard('10', '♠', 4),
        createCard('J', '♠', 5)
      ];
      const tripleCards = [
        createCard('K', '♠', 6),
        createCard('K', '♣', 7),
        createCard('K', '♥', 8),
        createCard('2', '♠', 9),
        createCard('3', '♠', 10)
      ];
      expect(compareFiveCardCombinations(tripleCards, straightCards)).toBe(false);
    });
  });
}); 