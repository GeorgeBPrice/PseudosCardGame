import { CardType, Play } from '../GameRules';
import { chooseBestPlay } from '../AIGameStrategy';

describe('AI Strategy', () => {
    it('should be defined', () => {
        expect(chooseBestPlay).toBeDefined();
    });

    it('should choose the lowest single if leading', () => {
        const hand: CardType[] = [
            { id: 1, suit: 'H', value: '3' },
            { id: 2, suit: 'D', value: '5' },
            { id: 3, suit: 'C', value: '7' },
        ];
        const lastPlay: Play | null = null;
        const chosenPlay = chooseBestPlay(hand, lastPlay);
        // Expect the lowest card (3H)
        expect(chosenPlay).toBeDefined();
        expect(chosenPlay?.type).toBe('single');
        expect(chosenPlay?.cards).toHaveLength(1);
        expect(chosenPlay?.cards[0].id).toBe(1);
        expect(chosenPlay?.rankValue).toBe(3);
    });

    it('should choose the lowest valid single to beat a previous single', () => {
        const hand: CardType[] = [
            { id: 1, suit: 'H', value: '3' }, // Too low
            { id: 2, suit: 'D', value: '5' }, // Valid
            { id: 3, suit: 'C', value: '7' }, // Valid but higher
        ];
        const lastPlay: Play = {
            type: 'single',
            cards: [{ id: 0, suit: 'S', value: '4' }],
            rankValue: 4,
        };
        const chosenPlay = chooseBestPlay(hand, lastPlay);
        // Expect the lowest valid card (5D)
        expect(chosenPlay).toBeDefined();
        expect(chosenPlay?.type).toBe('single');
        expect(chosenPlay?.cards).toHaveLength(1);
        expect(chosenPlay?.cards[0].id).toBe(2);
        expect(chosenPlay?.rankValue).toBe(5);
    });

    it('should pass if no valid play exists', () => {
        const hand: CardType[] = [
            { id: 1, suit: 'H', value: '3' },
            { id: 2, suit: 'D', value: '5' },
        ];
        const lastPlay: Play = {
            type: 'single',
            cards: [{ id: 0, suit: 'S', value: '6' }], // Needs higher than 6
            rankValue: 6,
        };
        const chosenPlay = chooseBestPlay(hand, lastPlay);
        expect(chosenPlay).toBeNull();
    });

    // New Tests Start Here
    it('should choose the lowest pair if leading', () => {
        const hand: CardType[] = [
            { id: 1, suit: 'S', value: '3' },
            { id: 2, suit: 'H', value: '5' },
            { id: 3, suit: 'D', value: '5' }, // Lowest pair
            { id: 4, suit: 'C', value: '7' },
            { id: 5, suit: 'S', value: '7' }, // Higher pair
        ];
        const lastPlay: Play | null = null;
        const gameState = { playAreaLength: 1 }; // Indicate not game start
        const chosenPlay = chooseBestPlay(hand, lastPlay, gameState);
        // Expect the lowest pair (5D, 5H)
        expect(chosenPlay).toBeDefined();
        expect(chosenPlay?.type).toBe('pair');
        expect(chosenPlay?.cards).toHaveLength(2);
        expect(chosenPlay?.rankValue).toBe(5);
        // Check if the correct cards are included (order doesn't matter)
        expect(chosenPlay?.cards.map((c: CardType) => c.id).sort()).toEqual([2, 3]);
    });

    it('should choose the lowest valid pair to beat a previous pair', () => {
        const hand: CardType[] = [
            { id: 1, suit: 'S', value: '4' }, 
            { id: 2, suit: 'H', value: '4' }, // Too low
            { id: 3, suit: 'D', value: '6' }, 
            { id: 4, suit: 'C', value: '6' }, // Lowest valid pair
            { id: 5, suit: 'S', value: '8' },
            { id: 6, suit: 'D', value: '8' }, // Higher valid pair
        ];
        const lastPlay: Play = {
            type: 'pair',
            cards: [{ id: 0, suit: 'S', value: '5' }, { id: 9, suit: 'C', value: '5' }],
            rankValue: 5,
            highestSuitValue: 2 // Suit C
        };
        const chosenPlay = chooseBestPlay(hand, lastPlay);
        // Expect the lowest valid pair (6D, 6C)
        expect(chosenPlay).toBeDefined();
        expect(chosenPlay?.type).toBe('pair');
        expect(chosenPlay?.cards).toHaveLength(2);
        expect(chosenPlay?.rankValue).toBe(6);
        expect(chosenPlay?.cards.map((c: CardType) => c.id).sort()).toEqual([3, 4]);
    });

    it('should prioritize the lowest 5-card hand (straight) when leading', () => {
        const hand: CardType[] = [
            { id: 1, suit: 'S', value: '3' }, // Part of straight
            { id: 2, suit: 'H', value: '4' }, // Part of straight
            { id: 3, suit: 'D', value: '5' }, // Part of straight & pair
            { id: 4, suit: 'C', value: '5' }, // Part of pair
            { id: 5, suit: 'S', value: '6' }, // Part of straight
            { id: 6, suit: 'D', value: '7' }, // Part of straight
            { id: 7, suit: 'C', value: '9' }, 
        ];
        const lastPlay: Play | null = null;
        const gameState = { playAreaLength: 1 }; // Indicate not game start
        const chosenPlay = chooseBestPlay(hand, lastPlay, gameState);
        // Expect the straight (3-7)
        expect(chosenPlay).toBeDefined();
        expect(chosenPlay?.type).toBe('straight');
        expect(chosenPlay?.cards).toHaveLength(5);
        expect(chosenPlay?.rankValue).toBe(7);
        expect(chosenPlay?.cards.map((c: CardType) => c.id).sort()).toEqual([1, 2, 3, 5, 6]); // Use one of the 5s
    });

    it('should choose the lowest valid straight to beat a previous straight', () => {
        const hand: CardType[] = [
            // Lower straight (4-8)
            { id: 1, suit: 'S', value: '4' }, 
            { id: 2, suit: 'H', value: '5' }, 
            { id: 3, suit: 'D', value: '6' }, 
            { id: 4, suit: 'C', value: '7' }, 
            { id: 5, suit: 'S', value: '8' }, 
            // Higher straight (5-9)
            { id: 6, suit: 'H', value: '5' }, 
            { id: 7, suit: 'D', value: '6' }, 
            { id: 8, suit: 'C', value: '7' }, 
            { id: 9, suit: 'S', value: '8' }, 
            { id: 10, suit: 'D', value: '9' },
        ];
        const lastPlay: Play = {
            type: 'straight',
            cards: [
                { id: 11, suit: 'S', value: '3' }, 
                { id: 12, suit: 'H', value: '4' }, 
                { id: 13, suit: 'D', value: '5' }, 
                { id: 14, suit: 'C', value: '6' }, 
                { id: 15, suit: 'S', value: '7' }
            ],
            rankValue: 7, // Highest card is 7
            highestSuitValue: 1 // Suit S
        };
        const chosenPlay = chooseBestPlay(hand, lastPlay);
        // Expect the lowest valid straight (4-8)
        expect(chosenPlay).toBeDefined();
        expect(chosenPlay?.type).toBe('straight');
        expect(chosenPlay?.cards).toHaveLength(5);
        expect(chosenPlay?.rankValue).toBe(8);
        expect(chosenPlay?.cards.map((c: CardType) => c.id).sort()).toEqual([1, 2, 3, 4, 5]);
    });
    
    // TODO: Add tests for Full House (Triple+2)
    // TODO: Add tests for more complex strategies (holding high cards, breaking combos)

    // --- Defensive Strategy Tests ---

    it('should play HIGHEST valid single when opponent has <= 3 cards', () => {
        const hand: CardType[] = [
            { id: 1, suit: 'H', value: '3' }, // Too low
            { id: 2, suit: 'D', value: '5' }, // Valid low
            { id: 3, suit: 'C', value: '7' }, // Valid mid
            { id: 4, suit: 'S', value: '9' }, // Valid high
        ];
        const lastPlay: Play = { type: 'single', cards: [{ id: 0, suit: 'S', value: '4' }], rankValue: 4 };
        const gameState = { opponentCardCount: 3 }; // Trigger highest card logic
        const chosenPlay = chooseBestPlay(hand, lastPlay, gameState);

        // Expect the highest valid card (9S)
        expect(chosenPlay).toBeDefined();
        expect(chosenPlay?.type).toBe('single');
        expect(chosenPlay?.cards).toHaveLength(1);
        expect(chosenPlay?.cards[0].id).toBe(4); // 9S
        expect(chosenPlay?.rankValue).toBe(9);
    });

    it('should play SECOND HIGHEST valid single when opponent has 4/5 cards (assuming 50% trigger)', () => {
        // Mock Math.random to ensure defensive play triggers for predictability
        const originalRandom = Math.random;
        Math.random = () => 0.6; // Ensure >= 0.5

        const hand: CardType[] = [
            { id: 1, suit: 'H', value: '3' }, // Too low
            { id: 2, suit: 'D', value: '5' }, // Valid low
            { id: 3, suit: 'C', value: '7' }, // Valid mid (second highest)
            { id: 4, suit: 'S', value: '9' }, // Valid high
        ];
        const lastPlay: Play = { type: 'single', cards: [{ id: 0, suit: 'S', value: '4' }], rankValue: 4 };
        const gameState = { opponentCardCount: 5 }; // Trigger 50% chance logic
        const chosenPlay = chooseBestPlay(hand, lastPlay, gameState);

        // Expect the second highest valid card (7C)
        expect(chosenPlay).toBeDefined();
        expect(chosenPlay?.type).toBe('single');
        expect(chosenPlay?.cards).toHaveLength(1);
        expect(chosenPlay?.cards[0].id).toBe(3); // 7C
        expect(chosenPlay?.rankValue).toBe(7);

        // Restore original Math.random
        Math.random = originalRandom;
    });

    it('should play LOWEST valid single when opponent has 4/5 cards and only 2 options (current logic)', () => {
        // Mock Math.random to ensure defensive play triggers for predictability
        const originalRandom = Math.random;
        Math.random = () => 0.7; // Ensure >= 0.5

        const hand: CardType[] = [
            { id: 1, suit: 'H', value: '3' }, // Too low
            { id: 2, suit: 'D', value: '5' }, // Valid low
            { id: 4, suit: 'S', value: '9' }, // Valid high
        ];
        const lastPlay: Play = { type: 'single', cards: [{ id: 0, suit: 'S', value: '4' }], rankValue: 4 };
        const gameState = { opponentCardCount: 4 }; // Trigger 50% chance logic
        const chosenPlay = chooseBestPlay(hand, lastPlay, gameState);

        // Expect the LOWEST valid card (5D) because current logic chooses index length-2 when length is 2.
        // Possible plays sorted: [5D, 9S]. Length is 2. Index length-2 = 0.
        expect(chosenPlay).toBeDefined();
        expect(chosenPlay?.type).toBe('single');
        expect(chosenPlay?.cards).toHaveLength(1);
        expect(chosenPlay?.cards[0].id).toBe(2); // 5D (Index 0)
        expect(chosenPlay?.rankValue).toBe(5);

        // Restore original Math.random
        Math.random = originalRandom;
    });

    it('should play LOWEST valid single when opponent has > 5 cards', () => {
        const hand: CardType[] = [
            { id: 1, suit: 'H', value: '3' }, // Too low
            { id: 2, suit: 'D', value: '5' }, // Valid low
            { id: 3, suit: 'C', value: '7' }, // Valid mid
            { id: 4, suit: 'S', value: '9' }, // Valid high
        ];
        const lastPlay: Play = { type: 'single', cards: [{ id: 0, suit: 'S', value: '4' }], rankValue: 4 };
        const gameState = { opponentCardCount: 6 }; // Trigger default lowest card logic
        const chosenPlay = chooseBestPlay(hand, lastPlay, gameState);

        // Expect the lowest valid card (5D)
        expect(chosenPlay).toBeDefined();
        expect(chosenPlay?.type).toBe('single');
        expect(chosenPlay?.cards).toHaveLength(1);
        expect(chosenPlay?.cards[0].id).toBe(2); // 5D
        expect(chosenPlay?.rankValue).toBe(5);
    });
}); 