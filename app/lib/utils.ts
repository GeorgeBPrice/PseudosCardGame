import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CardType, cardValues, suitValues } from "../components/contexts/GameRules";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sorts an array of cards in place, first by rank (ascending), then by suit (ascending).
 * @param cards - The array of CardType objects to sort.
 * @returns The sorted array (mutated in place).
 */
export function sortCards(cards: CardType[]): CardType[] {
  return cards.sort((a, b) => {
    const rankDiff = cardValues[a.value] - cardValues[b.value];
    if (rankDiff !== 0) return rankDiff;
    return suitValues[a.suit] - suitValues[b.suit];
  });
}
