/**
 * @fileoverview Game Context Provider and Hook for Pusoy Dos card game
 * 
 * This file defines the React Context and Provider for managing the game state and logic
 * for a Pusoy Dos card game. It includes:
 * 
 * - GameContext: React Context containing game state and actions
 * - useGameContext: Custom hook to access the game context
 * - GameContextType: TypeScript interface defining the shape of the context
 * 
 * The context manages:
 * - Player and computer hands
 * - Play area (currently played cards)
 * - Selected cards for playing
 * - Turn management (player vs computer)
 * - Game status (current player, winner, game messages)
 * - Game statistics (wins)
 * - Game modes (doubles round, five card round)
 * - Game actions (select/play cards, draw cards, computer AI)
 * 
 * @requires React
 * @requires GameRules
 * 
 * @exports GameContext
 * @exports useGameContext
 * @exports GameContextType
 * @exports CardType
 * @exports isValidStraight
 */


import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CardType,
  cardValues,
  suitValues,
  isValidStraight,
  isValidTriplePlusTwo,
  compareFiveCardCombinations,
  isValidMove,
  getHighestSuitInStraight
} from "./GameRules";

export type { CardType };
export { isValidStraight };

interface GameContextType {
  playerHand: CardType[];
  computerHand: CardType[];
  playArea: CardType[];
  selectedCards: CardType[];
  currentPlayer: "player" | "computer";
  deckSize: number;
  gameMessage: string;
  winner: "player" | "computer" | null;
  playerWins: number;
  computerWins: number;
  isDoublesRound: boolean;
  isFiveCardRound: boolean;
  selectCard: (card: CardType) => void;
  deselectCard: (card: CardType) => void;
  playSelectedCards: () => void;
  drawCard: () => void;
  computerPlay: () => void;
  startGame: () => void;
  playAgain: () => void;
}

/**
 * The game context contains the state and actions of the game.
 * It includes the current player, the cards in the player's hand,
 * the cards in the computer's hand, the cards in the play area,
 * the cards that are currently selected, the number of cards in the deck,
 * and the game message (like "Player's turn" or "Computer wins!").
 * It also includes functions to select and deselect cards, play the selected cards,
 * draw a card from the deck, make the computer play, start a new game, and play again.
 */
const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

let deck: CardType[] = [];

/**
 * Create a shuffled 52-card deck (suits x ranks).
 */
function createDeck() {
  const suits = ["♥", "♦", "♣", "♠"];
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];
  const newDeck: CardType[] = [];

  for (let suit of suits) {
    for (let value of values) {
      newDeck.push({ id: newDeck.length, suit, value });
    }
  }
  return shuffleDeck(newDeck);
}

function shuffleDeck(deck: CardType[]) {
  for (let i = 0; i < 3; i++) {
    deck.sort(() => Math.random() - 0.5);
  }
  return deck;
}

/**
 * Compare two 5-card combinations to determine if the new one beats the last one
 */


export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [computerHand, setComputerHand] = useState<CardType[]>([]);
  const [playArea, setPlayArea] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"player" | "computer">(
    "player"
  );
  const [deckSize, setDeckSize] = useState(52);
  const [gameMessage, setGameMessage] = useState("");
  const [winner, setWinner] = useState<"player" | "computer" | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerWins, setPlayerWins] = useState(0);
  const [computerWins, setComputerWins] = useState(0);
  const [isDoublesRound, setIsDoublesRound] = useState(false);
  const [isFiveCardRound, setIsFiveCardRound] = useState(false);
  const [lastMoveWasDouble, setLastMoveWasDouble] = useState(false);
  const [lastMoveWasFiveCard, setLastMoveWasFiveCard] = useState(false);
  const [roundReset, setRoundReset] = useState(false);

  /**
   * Start a new game with fresh deck/hands.
   */
  const startGame = () => {
    deck = createDeck();
    const initialPlayerHand = deck.splice(0, 10);
    const initialComputerHand = deck.splice(0, 10);

    setPlayerHand(initialPlayerHand);
    setComputerHand(initialComputerHand);
    setDeckSize(deck.length);
    setPlayArea([]);
    setSelectedCards([]);
    setGameMessage("");
    setWinner(null);
    setGameStarted(true);

    setIsDoublesRound(false);
    setIsFiveCardRound(false);
    setLastMoveWasDouble(false);
    setLastMoveWasFiveCard(false);
    setRoundReset(false);

    // Randomly choose first player
    if (Math.random() < 0.5) {
      setCurrentPlayer("player");
      setGameMessage("Game started. Player's turn.");
    } else {
      setCurrentPlayer("computer");
      setGameMessage("Game started. Computer's turn.");
    }
  };

  /**
   * Moves a card from player's hand to selected, up to 5.
   */
  const selectCard = (card: CardType) => {
    if (selectedCards.length < 5) {
      setSelectedCards((prev) => [...prev, card]);
      setPlayerHand((prev) => prev.filter((c) => c.id !== card.id));
    }
  };

  /**
   * Moves a card from selected back to player's hand.
   */
  const deselectCard = (card: CardType) => {
    setSelectedCards((prev) => prev.filter((c) => c.id !== card.id));
    setPlayerHand((prev) => [...prev, card]);
  };

  /**
   * Return the last move's cards (single or double).
   * If no cards in play, returns [].
   */
  const getLastPlayedCards = (): CardType[] => {
    if (playArea.length === 0) return [];
    if (lastMoveWasDouble && playArea.length >= 2) {
      // Last move was a double, so the last 2 cards in the array
      return playArea.slice(-2);
    }
    // Otherwise single: just last card
    return playArea.slice(-1);
  };

  /**
   * Compare the new 'cards' to see if they beat the *last* move.
   * - If last was double, the new move must be double, same or higher rank, etc.
   * - If last was single, the new move must be single, higher rank, or same rank + higher suit.
   */
  const isValidMove = (cards: CardType[]): boolean => {
    if (!cards.length) return false;

    // Must match single/double/five from last move, unless roundReset (someone drew)
    if (!roundReset) {
      if (lastMoveWasDouble && cards.length !== 2) {
        return false; // must play double if last move was double
      }
      if (lastMoveWasFiveCard && cards.length !== 5) {
        return false; // must play five if last move was five
      }
      if (!lastMoveWasDouble && !lastMoveWasFiveCard && cards.length !== 1) {
        return false; // must play single if last move was single
      }
    }

    // For doubles, ensure both are same rank
    if (cards.length === 2 && cards[0].value !== cards[1].value) {
      return false;
    }

    // For five cards, must be either triple + 2 or straight
    if (cards.length === 5 && !isValidTriplePlusTwo(cards) && !isValidStraight(cards)) {
      return false;
    }

    const lastPlayed = getLastPlayedCards();
    if (!lastPlayed.length) {
      // Nothing in play => any valid single/double/five is ok
      return true;
    }

    // Evaluate rank/suit of the last played
    if (lastPlayed.length === 1) {
      // Single -> compare new single
      const lastCard = lastPlayed[0];
      const lastRank = cardValues[lastCard.value];
      const lastSuit = suitValues[lastCard.suit];

      const newCard = cards[0];
      const newRank = cardValues[newCard.value];
      const newSuit = suitValues[newCard.suit];

      // Compare rank first
      if (newRank > lastRank) return true;
      // If rank is the same, compare suit
      if (newRank === lastRank && newSuit > lastSuit) return true;
      return false;
    } else if (lastPlayed.length === 2) {
      // Double -> compare new double
      const [c1, c2] = lastPlayed;
      const lastRank = cardValues[c1.value]; // c1 and c2 have same rank
      const lastSuits = [suitValues[c1.suit], suitValues[c2.suit]];
      const lastMaxSuit = Math.max(...lastSuits);

      const [n1, n2] = cards;
      const newRank = cardValues[n1.value]; // n1 and n2 have same rank
      const newSuits = [suitValues[n1.suit], suitValues[n2.suit]];
      const newMaxSuit = Math.max(...newSuits);

      // Compare rank
      if (newRank > lastRank) return true;
      // If rank is same, compare the highest suit in each pair
      if (newRank === lastRank && newMaxSuit > lastMaxSuit) return true;
      return false;
    } else if (lastPlayed.length === 5) {
      // Five cards -> compare new five cards
      const isLastStraight = isValidStraight(lastPlayed);
      const isNewStraight = isValidStraight(cards);
      
      // If last play was a straight, new play must be a higher straight
      if (isLastStraight && !isNewStraight) return false;
      
      // If last play was triple + 2, new play must be either:
      // 1. A straight (which always wins)
      // 2. A higher triple + 2
      if (!isLastStraight && !isNewStraight) {
        const getTripleValue = (cards: CardType[]): number => {
          const valueCounts: Record<string, number> = {};
          cards.forEach(card => {
            valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
          });
          const tripleValue = Object.entries(valueCounts).find(([_, count]) => count === 3)?.[0];
          return tripleValue ? (tripleValue === 'A' ? 14 : cardValues[tripleValue]) : 0;
        };
        
        const lastTripleValue = getTripleValue(lastPlayed);
        const newTripleValue = getTripleValue(cards);
        
        return newTripleValue > lastTripleValue;
      }
      
      // If we get here, it means we're comparing straights
      return compareFiveCardCombinations(cards, lastPlayed);
    }

    return false;
  };

  /**
   * Attempts to play the selectedCards if valid.
   */
  const playSelectedCards = () => {
    if (!selectedCards.length) return;

    // If not in a "draw reset" state, check validity
    if (!roundReset && !isValidMove(selectedCards)) {
      // Return cards to player's hand
      setPlayerHand((prev) => [...prev, ...selectedCards]);
      setSelectedCards([]);
      setGameMessage("Invalid move. Please try again.");
      return;
    }

    // Valid => add to table
    setPlayArea((prev) => [...prev, ...selectedCards]);

    // If the current player is the user
    if (currentPlayer === "player") {
      setPlayerHand((prev) =>
        prev.filter((card) => !selectedCards.includes(card))
      );
      // Did they run out of cards?
      if (playerHand.length - selectedCards.length === 0) {
        setGameMessage("Player has no more cards!");
      } else {
        if (selectedCards.length === 1) {
          setGameMessage(`Player played ${selectedCards[0].value}${selectedCards[0].suit}. Computer's turn.`);
        } else if (selectedCards.length === 2) {
          setGameMessage(`Player played 2 cards (${selectedCards[0].value}s). Computer's turn.`);
        } else if (selectedCards.length === 5) {
          setGameMessage(`Player played 5 cards. Computer's turn.`);
        }
      }
      setCurrentPlayer("computer");
    } else {
      // If the current player is computer
      setComputerHand((prev) =>
        prev.filter((card) => !selectedCards.includes(card))
      );
      if (computerHand.length - selectedCards.length === 0) {
        setGameMessage("Computer has no more cards!");
      } else {
        setGameMessage("Computer played. Player's turn.");
      }
      setCurrentPlayer("player");
    }

    // If we just played doubles, or single
    setIsDoublesRound(selectedCards.length === 2);
    setIsFiveCardRound(selectedCards.length === 5);
    setLastMoveWasDouble(selectedCards.length === 2);
    setLastMoveWasFiveCard(selectedCards.length === 5);

    // Reset selection
    setSelectedCards([]);
    setRoundReset(false);
  };

  /**
   * Draw a card from the deck for the current player, skipping validity checks.
   */
  const drawCard = () => {
    if (deckSize > 0) {
      const newCard = deck.pop();
      if (newCard) {
        if (currentPlayer === "player") {
          setPlayerHand((prev) => [...prev, newCard]);
          setGameMessage("Player drew a card. Computer's turn.");
        } else {
          setComputerHand((prev) => [...prev, newCard]);
          setGameMessage("Computer drew a card. Player's turn.");
        }
        setDeckSize((prev) => prev - 1);
      }
      // Switch turn
      setCurrentPlayer(currentPlayer === "player" ? "computer" : "player");
      // Don't reset the round type when drawing
      setRoundReset(true); // any move is valid next
    }
  };

  /**
   * Computer tries to find a valid card or draws if none found.
   */
  const computerPlay = () => {
    if (computerHand.length === 0) return;

    const lastPlayed = getLastPlayedCards();

    // Helper to see if 'card' is strictly higher than 'lastCard'
    // (Rank first, then suit)
    const isCardHigher = (card: CardType, lastCard: CardType) => {
      const cardValue = cardValues[card.value];
      const lastCardValue = cardValues[lastCard.value];
      if (cardValue > lastCardValue) return true;
      if (cardValue === lastCardValue) {
        return suitValues[card.suit] > suitValues[lastCard.suit];
      }
      return false;
    };

    // Handle 5-card round
    if (lastMoveWasFiveCard && !roundReset) {
      // Find all possible 5-card combinations
      const possibleCombinations: CardType[][] = [];
      
      // Find triple + 2 combinations
      const valueCounts: Record<string, CardType[]> = {};
      computerHand.forEach(card => {
        if (!valueCounts[card.value]) {
          valueCounts[card.value] = [];
        }
        valueCounts[card.value].push(card);
      });
      
      // Find all triples
      Object.entries(valueCounts).forEach(([value, cards]) => {
        if (cards.length >= 3) {
          // Get all possible combinations of 3 cards from this value
          for (let i = 0; i < cards.length - 2; i++) {
            for (let j = i + 1; j < cards.length - 1; j++) {
              for (let k = j + 1; k < cards.length; k++) {
                const triple = [cards[i], cards[j], cards[k]];
                // Add any 2 other cards to complete the 5-card combination
                const remainingCards = computerHand.filter(c => !triple.includes(c));
                for (let l = 0; l < remainingCards.length - 1; l++) {
                  for (let m = l + 1; m < remainingCards.length; m++) {
                    possibleCombinations.push([...triple, remainingCards[l], remainingCards[m]]);
                  }
                }
              }
            }
          }
        }
      });
      
      // Find all possible straights
      const sortedHand = [...computerHand].sort((a, b) => cardValues[a.value] - cardValues[b.value]);
      for (let i = 0; i <= sortedHand.length - 5; i++) {
        const potentialStraight = sortedHand.slice(i, i + 5);
        if (isValidStraight(potentialStraight)) {
          possibleCombinations.push(potentialStraight);
        }
      }
      
      // Find a valid combination that beats the last play
      for (const combination of possibleCombinations) {
        if (isValidMove(combination)) {
          setComputerHand((prev) => prev.filter((c) => !combination.includes(c)));
          setPlayArea((prev) => [...prev, ...combination]);
          setGameMessage(
            `Computer played 5 cards. Player's turn.`
          );
          setCurrentPlayer("player");
          setIsFiveCardRound(true);
          setLastMoveWasFiveCard(true);
          setRoundReset(false);
          return;
        }
      }
      
      // No valid 5-card combination found => draw
      drawCard();
      return;
    }

    // Handle doubles round
    if (lastMoveWasDouble && !roundReset) {
      // Attempt to play a higher double
      const [lc1] = lastPlayed; // both have same rank
      for (let i = 0; i < computerHand.length; i++) {
        for (let j = i + 1; j < computerHand.length; j++) {
          if (computerHand[i].value === computerHand[j].value) {
            // Found a pair
            // Compare rank/suit to the last pair
            const candidatePair = [computerHand[i], computerHand[j]];
            if (isValidMove(candidatePair)) {
              // Found a valid pair
              setComputerHand((prev) =>
                prev.filter((c) => !candidatePair.includes(c))
              );
              setPlayArea((prev) => [...prev, ...candidatePair]);
              setGameMessage(
                `Computer played 2 cards (${candidatePair[0].value}s). Player's turn.`
              );
              setCurrentPlayer("player");
              setIsDoublesRound(true);
              setIsFiveCardRound(false);
              setLastMoveWasDouble(true);
              setLastMoveWasFiveCard(false);
              setRoundReset(false);
              return;
            }
          }
        }
      }
      // No valid pair found => draw
      drawCard();
      return;
    }

    // Handle single card or round reset
    // If roundReset = true, any single is valid, so pick the lowest or random card
    let playableCards: CardType[];

    if (roundReset || lastPlayed.length === 0) {
      // Round reset or no cards => any single is valid
      playableCards = computerHand;
    } else {
      // Must beat the last single card
      const lastCard = lastPlayed[0];
      playableCards = computerHand.filter((c) => isCardHigher(c, lastCard));
    }

    if (playableCards.length > 0) {
      // Let's pick the *lowest* valid card to keep AI somewhat "logical"
      // e.g. sorted ascending by rank/suit
      playableCards.sort((a, b) => {
        const valDiff = cardValues[a.value] - cardValues[b.value];
        if (valDiff !== 0) return valDiff;
        return suitValues[a.suit] - suitValues[b.suit];
      });

      const chosen = playableCards[0];
      setComputerHand((prev) => prev.filter((c) => c.id !== chosen.id));
      setPlayArea((prev) => [...prev, chosen]);
      setGameMessage(
        `Computer played ${chosen.value}${chosen.suit}. Player's turn.`
      );
      setCurrentPlayer("player");
      setIsDoublesRound(false);
      setIsFiveCardRound(false);
      setLastMoveWasDouble(false);
      setLastMoveWasFiveCard(false);
      setRoundReset(false);
    } else {
      // No valid single => draw
      drawCard();
    }
  };

  /**
   * Start a fresh game after it ends.
   */
  const playAgain = () => {
    startGame();
  };

  /**
   * After each update, check if someone is out of cards => they win.
   */
  useEffect(() => {
    if (!gameStarted || winner) return;

    if (playerHand.length === 0) {
      setWinner("player");
      setPlayerWins((prev) => prev + 1);
      setGameMessage("Player wins the game!");
    } else if (computerHand.length === 0) {
      setWinner("computer");
      setComputerWins((prev) => prev + 1);
      setGameMessage("Computer wins the game!");
    }
  }, [gameStarted, winner, playerHand, computerHand]);

  return (
    <GameContext.Provider
      value={{
        playerHand,
        computerHand,
        playArea,
        selectedCards,
        currentPlayer,
        deckSize,
        gameMessage,
        winner,
        playerWins,
        computerWins,
        isDoublesRound,
        isFiveCardRound,
        selectCard,
        deselectCard,
        playSelectedCards,
        drawCard,
        computerPlay,
        startGame,
        playAgain,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
