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
  isValidMove as isContextValidMove,
  getHighestSuitInStraight,
  Play,
  getPlayInfo
} from "./GameRules";
import { chooseBestPlay } from "./AIGameStrategy";

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
    // Check for 5-card hand first
    if (lastMoveWasFiveCard && playArea.length >= 5) {
      return playArea.slice(-5);
    }
    // Then check for doubles
    if (lastMoveWasDouble && playArea.length >= 2) {
      return playArea.slice(-2);
    }
    // Otherwise, it must be a single (or the start)
    if (playArea.length >= 1) {
        return playArea.slice(-1);
    }
    return []; // Should not happen if playArea has cards, but safe fallback
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
    if (winner || currentPlayer !== "computer") return;
    if (computerHand.length === 0) {
      setWinner("computer");
      setGameMessage("Computer wins!");
      setComputerWins(prev => prev + 1);
      return;
    }

    // Determine the last valid play to beat
    const lastCardsPlayed = getLastPlayedCards();
    let lastPlay: Play | null = null;
    if (lastCardsPlayed.length > 0 && !roundReset) {
      const playInfo = getPlayInfo(lastCardsPlayed);
      if (playInfo) {
        lastPlay = playInfo;
      }
    }

    // Call the AI strategy function
    const gameState = { 
        playAreaLength: playArea.length, 
        opponentCardCount: playerHand.length // Pass opponent's (player's) card count
    }; 
    const bestPlay = chooseBestPlay(computerHand, lastPlay, gameState);

    if (bestPlay && bestPlay.cards.length > 0) {
      // AI found a valid play
      setPlayArea((prev) => [...prev, ...bestPlay.cards]);
      setComputerHand((prev) =>
        prev.filter((card) => !bestPlay.cards.some((pc: CardType) => pc.id === card.id))
      );

      const remainingHand = computerHand.filter((card) => !bestPlay.cards.some((pc: CardType) => pc.id === card.id));

      if (remainingHand.length === 0) {
        setWinner("computer");
        setGameMessage("Computer has no more cards! Computer wins!");
        setComputerWins(prev => prev + 1);
      } else {
        // Construct message based on play type
        let message = "Computer played";
        if (bestPlay.type === 'single') {
          message += ` ${bestPlay.cards[0].value}${bestPlay.cards[0].suit}.`;
        } else if (bestPlay.type === 'pair') {
          message += ` a pair of ${bestPlay.cards[0].value}s.`;
        } else if (bestPlay.type === 'triple') {
          message += ` three ${bestPlay.cards[0].value}s.`;
        } else {
          message += ` ${bestPlay.cards.length} cards.`; // Generic for 5-card hands for now
        }
        message += " Player's turn.";
        setGameMessage(message);
      }

      // Update round state based on the AI's play
      const playedFive = bestPlay.cards.length === 5 && (bestPlay.type === 'straight' || bestPlay.type === 'fullhouse'); // More specific check
      setIsDoublesRound(bestPlay.type === 'pair');
      setIsFiveCardRound(playedFive);
      setLastMoveWasDouble(bestPlay.type === 'pair');
      setLastMoveWasFiveCard(playedFive); 
      setRoundReset(false);
      setCurrentPlayer("player");

    } else {
      // AI chooses to pass (or couldn't find a move) -> Draw a card
      if (deckSize > 0) {
        const newCard = deck.pop();
        if (newCard) {
          setComputerHand((prev) => [...prev, newCard]);
          setGameMessage("Computer drew a card. Player's turn.");
          setDeckSize((prev) => prev - 1);
        }
        setRoundReset(true); // Round resets after draw
        setCurrentPlayer("player");
      } else {
        // No cards left in deck, computer must pass turn
        setGameMessage("Computer passes. Player's turn.");
        setRoundReset(true); // Round resets after pass
        setCurrentPlayer("player");
      }
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
    if (playerHand.length === 0 && gameStarted) {
      setWinner("player");
      setGameMessage("Player wins!");
      setPlayerWins(prev => prev + 1);
    } else if (computerHand.length === 0 && gameStarted) {
      setWinner("computer");
      setGameMessage("Computer wins!");
      setComputerWins(prev => prev + 1);
    }
  }, [playerHand, computerHand, gameStarted]);

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
