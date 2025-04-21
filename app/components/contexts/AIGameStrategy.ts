import { CardType, Play, getPlayInfo, isValidMove, cardValues, suitValues } from "./GameRules";
import { sortCards } from "../../lib/utils";

/**
 * Determines the best play for the AI given its hand and the current game state.
 * @param hand The AI's current hand.
 * @param lastPlay The last play made in the current trick, or null if the AI is leading.
 * @param gameState Additional game state information (currently unused, placeholder).
 * @returns The best Play object or null if the AI should pass.
 */
export function chooseBestPlay(
    hand: CardType[],
    lastPlay: Play | null,
    // Expand gameState type
    gameState: { playAreaLength?: number; opponentCardCount?: number } | null | undefined = null
): Play | null {
    let possiblePlays: Play[] = [];
    // Determine if it's the absolute start (no last play AND play area is empty)
    const isGameStart = !lastPlay && (gameState?.playAreaLength === 0 || gameState === null);
    // Determine if the AI is leading (no last play, but not necessarily game start)
    const isLeading = !lastPlay;

    // 1. Determine required play type and find potential plays
    if (isGameStart) {
        possiblePlays = findPlaysOfType(hand, 'single');
    } else if (isLeading) {
        possiblePlays = findPlaysOfType(hand, 'any');
    } else if (lastPlay) { 
        possiblePlays = findPlaysOfType(hand, lastPlay.type);
        possiblePlays = possiblePlays.filter(play => isValidMove(play.cards, lastPlay.cards));
    } else {
        return null; 
    }

    // 2. Select the best play based on strategy
    if (possiblePlays.length === 0) {
        return null; // Pass if no valid plays
    }

    // --- Initial Sort (Lowest First) ---
    // Sort possible plays: prioritize 5-card, then lowest rank/suit
    possiblePlays.sort((a, b) => {
        const typeOrder: { [key in Play['type']]?: number } = {
             'straight': 1,
             'fullhouse': 1, 
             'pair': 2,
             'single': 3 
        }; 
        const typeDiff = (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
        if (typeDiff !== 0) return typeDiff;
        
        const rankDiff = a.rankValue - b.rankValue;
        if (rankDiff !== 0) return rankDiff;

        const suitA = a.highestSuitValue || 0;
        const suitB = b.highestSuitValue || 0;
        return suitA - suitB;
    });

    // --- Apply Defensive Strategy based on Opponent Card Count ---
    let chosenPlay = possiblePlays[0]; // Default to lowest valid play
    const opponentCards = gameState?.opponentCardCount;

    if (opponentCards !== undefined && possiblePlays.length > 0) {
        if (opponentCards <= 3) {
            // Play highest card/combo if opponent is close to winning
            chosenPlay = possiblePlays[possiblePlays.length - 1];
        } else if (opponentCards <= 5) {
            // 50% chance to play defensively (second highest, or highest if only 2 options)
            if (Math.random() >= 0.5) {
                if (possiblePlays.length >= 2) {
                    chosenPlay = possiblePlays[possiblePlays.length - 2];
                } else {
                    // If only one play possible, or exactly 2, play the highest/only one
                    chosenPlay = possiblePlays[possiblePlays.length - 1]; 
                }
            }
            // Else: stick with the default lowest play (chosenPlay already set)
        }
    }
    // Else (opponentCards undefined or > 5): stick with default lowest play
    
    return chosenPlay;
}

// Helper function to find all possible plays of a specific type
function findPlaysOfType(hand: CardType[], type: Play['type'] | 'any'): Play[] {
    const plays: Play[] = [];
    const sortedHand = sortCards([...hand]); // Use a copy
    const n = sortedHand.length;

    // Group cards by value (used for pairs, triples, full houses)
    const valueGroups: { [value: string]: CardType[] } = {};
    sortedHand.forEach((card: CardType) => {
        if (!valueGroups[card.value]) {
            valueGroups[card.value] = [];
        }
        valueGroups[card.value].push(card);
    });

    // Find Singles
    if (type === 'single' || type === 'any') {
        for (let i = 0; i < n; i++) {
            const potentialCards = [sortedHand[i]];
            const playInfo = getPlayInfo(potentialCards);
            if (playInfo) plays.push(playInfo);
        }
    }

    // Find Pairs
    if (type === 'pair' || type === 'any') {
        Object.values(valueGroups).forEach(group => {
            if (group.length >= 2) {
                for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                        const potentialCards = [group[i], group[j]];
                        const playInfo = getPlayInfo(potentialCards);
                        if (playInfo) plays.push(playInfo);
                    }
                }
            }
        });
    }

    // Find Straights
    if (type === 'straight' || type === 'any') {
        const uniqueRanks = Array.from(new Set(sortedHand.map(c => cardValues[c.value]))).sort((a, b) => a - b);
        
        if (uniqueRanks.length >= 5) {
            for (let i = 0; i <= uniqueRanks.length - 5; i++) {
                const potentialSequence = uniqueRanks.slice(i, i + 5);
                // Check if this sequence of 5 ranks is consecutive
                let isConsecutive = true;
                for (let j = 1; j < 5; j++) {
                    if (potentialSequence[j] !== potentialSequence[j - 1] + 1) {
                        isConsecutive = false;
                        break;
                    }
                }

                // Check for Ace-low straight (2, 3, 4, 5, 14)
                const isAceLow = potentialSequence.length === 5 && 
                                 potentialSequence.join(',') === '2,3,4,5,14';

                if (isConsecutive || isAceLow) {
                    // Found a valid sequence of 5 ranks. Now construct the best hand.
                    const straightCards: CardType[] = [];
                    potentialSequence.forEach(rankValue => {
                        // Find all cards in hand with this rank
                        const cardsOfRank = sortedHand.filter(card => cardValues[card.value] === rankValue);
                        // Pick the one with the highest suit
                        if (cardsOfRank.length > 0) {
                             cardsOfRank.sort((a,b) => suitValues[b.suit] - suitValues[a.suit]); // Sort descending by suit
                             straightCards.push(cardsOfRank[0]);
                        }
                    });
                    
                    // Should have 5 cards if hand contained all ranks
                    if (straightCards.length === 5) {
                       const playInfo = getPlayInfo(straightCards);
                       if (playInfo && playInfo.type === 'straight') {
                           plays.push(playInfo);
                       }
                    }
                }
            }
             // Allow use of Ace-2-3-4-5 sequence, sometimes you can sacrifice the ace to get a straight
             if (uniqueRanks.includes(14) && uniqueRanks.includes(2) && uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
                 const aceLowSequence = [14, 2, 3, 4, 5]; // Ace, 2, 3, 4, 5
                 const straightCards: CardType[] = [];
                 aceLowSequence.forEach(rankValue => {
                     const cardsOfRank = sortedHand.filter(card => cardValues[card.value] === rankValue);
                     if (cardsOfRank.length > 0) {
                          cardsOfRank.sort((a,b) => suitValues[b.suit] - suitValues[a.suit]);
                          straightCards.push(cardsOfRank[0]);
                     }
                 });
                 if (straightCards.length === 5) {
                       const playInfo = getPlayInfo(straightCards);
                       if (playInfo && playInfo.type === 'straight') {
                            // Avoid adding duplicates if already found via normal check
                           if (!plays.some(p => p.cards.map(c => c.id).sort().join(',') === straightCards.map(c => c.id).sort().join(','))) {
                               plays.push(playInfo);
                           }
                       }
                 }
             }
        }
    }
    
    // Find Half Houses (Triple + 2 randoms)
    if (type === 'fullhouse' || type === 'any') {
        Object.entries(valueGroups).forEach(([tripleValue, tripleGroup]) => {
            if (tripleGroup.length >= 3) {
                // Get combinations of 3 for the triple
                for (let i = 0; i < tripleGroup.length - 2; i++) {
                     for (let j = i + 1; j < tripleGroup.length - 1; j++) {
                        for (let k = j + 1; k < tripleGroup.length; k++) {
                            const tripleCards = [tripleGroup[i], tripleGroup[j], tripleGroup[k]];
                            const remainingHand = sortedHand.filter(c => !tripleCards.some(tc => tc.id === c.id));
                            
                            // Sort remaining cards by rank
                            const sortedRemaining = [...remainingHand].sort((a, b) => 
                                cardValues[a.value] - cardValues[b.value]
                            );

                            // Take the two lowest ranked cards
                            if (sortedRemaining.length >= 2) {
                                const lowestCards = sortedRemaining.slice(0, 2);
                                const potentialCards = [...tripleCards, ...lowestCards];
                                const playInfo = getPlayInfo(potentialCards);
                                // Ensure it's actually a fullhouse
                                if (playInfo && playInfo.type === 'fullhouse') plays.push(playInfo);
                            }
                        }
                    }
                }
            }
        });
    }

    // Find Full Houses (Triple + Pair) -- DISABLED FOR NOW
    // if (type === 'fullhouse' || type === 'any') {
    //     Object.entries(valueGroups).forEach(([tripleValue, tripleGroup]) => {
    //         if (tripleGroup.length >= 3) {
    //             // Get combinations of 3 for the triple
    //             for (let i = 0; i < tripleGroup.length - 2; i++) {
    //                     for (let j = i + 1; j < tripleGroup.length - 1; j++) {
    //                     for (let k = j + 1; k < tripleGroup.length; k++) {
    //                         const tripleCards = [tripleGroup[i], tripleGroup[j], tripleGroup[k]];
    //                         const remainingHand = sortedHand.filter(c => !tripleCards.some(tc => tc.id === c.id));
                            
    //                         // Find pairs in the remaining hand
    //                         const remainingValueGroups: { [value: string]: CardType[] } = {};
    //                         remainingHand.forEach(card => {
    //                             if (!remainingValueGroups[card.value]) remainingValueGroups[card.value] = [];
    //                             remainingValueGroups[card.value].push(card);
    //                         });

    //                         Object.entries(remainingValueGroups).forEach(([pairValue, pairGroup]) => {
    //                             if (pairGroup.length >= 2) {
    //                                 // Get combinations of 2 for the pair
    //                                 for(let p1 = 0; p1 < pairGroup.length; p1++) {
    //                                     for (let p2 = p1 + 1; p2 < pairGroup.length; p2++) {
    //                                             const pairCards = [pairGroup[p1], pairGroup[p2]];
    //                                             const potentialCards = [...tripleCards, ...pairCards];
    //                                             const playInfo = getPlayInfo(potentialCards);
    //                                             // Ensure it's actually a fullhouse
    //                                             if (playInfo && playInfo.type === 'fullhouse') plays.push(playInfo);
    //                                     }
    //                                 }
    //                             }
    //                         });
    //                     }
    //                 }
    //             }
    //         }
    //     });
    // }


    return plays;
}

// TODO: Add finding logic for other types (Triple, Quads, Straight Flush) if needed
// function findStraights(hand: Card[]): Card[][];
// function findAllValidPlays(hand: Card[], lastPlay: Play | null): Play[]; 