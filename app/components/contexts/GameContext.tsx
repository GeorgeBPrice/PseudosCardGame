import React, { createContext, useContext, useState, useEffect } from "react";

export interface CardType {
  id: number;
  value: string;
  suit: string;
}

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
  selectCard: (card: CardType) => void;
  deselectCard: (card: CardType) => void;
  playSelectedCards: () => void;
  drawCard: () => void;
  computerPlay: () => void;
  startGame: () => void;
  playAgain: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

// Ranks: 2 (2) ... 10 (10), J(11), Q(12), K(13), A(14)
const cardValues: Record<string, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

// Suits: ♠(1) < ♣(2) < ♦(3) < ♥(4)  (lowest to highest)
const suitValues: Record<string, number> = {
  "♠": 1,
  "♣": 2,
  "♦": 3,
  "♥": 4,
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

  // This indicates *current move* (the one being played).
  // We do still need to enforce "2 cards if last was doubles, else 1 if last was single".
  const [isDoublesRound, setIsDoublesRound] = useState(false);

  // Track if the *last move* was double. Different from the *current* isDoublesRound
  // so we can properly compare new plays to the last play.
  const [lastMoveWasDouble, setLastMoveWasDouble] = useState(false);

  // If the previous move ended with a "draw", that resets the round, so we skip some validity checks
  const [roundReset, setRoundReset] = useState(false);

  /**
   * Start a new game with fresh deck/hands.
   */
  const startGame = () => {
    deck = createDeck();
    const initialPlayerHand = deck.splice(0, 7);
    const initialComputerHand = deck.splice(0, 7);

    setPlayerHand(initialPlayerHand);
    setComputerHand(initialComputerHand);
    setDeckSize(deck.length);
    setPlayArea([]);
    setSelectedCards([]);
    setGameMessage("");
    setWinner(null);
    setGameStarted(true);

    setIsDoublesRound(false);
    setLastMoveWasDouble(false);
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
   * Moves a card from player's hand to selected, up to 2 if doubles.
   */
  const selectCard = (card: CardType) => {
    if (selectedCards.length < 2) {
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

    // Must match single/double from last move, unless roundReset (someone drew)
    if (!roundReset) {
      if (lastMoveWasDouble && cards.length !== 2) {
        return false; // must play double if last move was double
      }
      if (!lastMoveWasDouble && cards.length !== 1) {
        return false; // must play single if last move was single
      }
    }

    // For doubles, ensure both are same rank
    if (cards.length === 2 && cards[0].value !== cards[1].value) {
      return false;
    }

    const lastPlayed = getLastPlayedCards();
    if (!lastPlayed.length) {
      // Nothing in play => any valid single/double is ok
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
    } else {
      // Double -> compare new double
      // The last double has the same rank, but we might want the highest suit from the last pair
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
    }
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
        setGameMessage("Player played. Computer's turn.");
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
    setLastMoveWasDouble(selectedCards.length === 2);

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
      setIsDoublesRound(false); // new round
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

    // Single or double from *last move*.
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
              setLastMoveWasDouble(true);
              setRoundReset(false);
              return;
            }
          }
        }
      }
      // No valid pair found => draw
      drawCard();
      return;
    } else {
      // Single scenario or round reset
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
        // Let's pick the *lowest* valid card to keep AI somewhat “logical”
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
        setLastMoveWasDouble(false);
        setRoundReset(false);
      } else {
        // No valid single => draw
        drawCard();
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
