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

const cardValues: { [key: string]: number } = {
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
  A: 14, // Ensure Ace is the highest value
};

const suitValues: { [key: string]: number } = {
  "♠": 1,
  "♣": 2,
  "♦": 3,
  "♥": 4,
};

let deck: CardType[] = [];

/**
 * Creates a shuffled deck of 52 cards, with each card represented as an
 * object with `id`, `suit`, and `value` properties.
 *
 * @returns {CardType[]} The shuffled deck of cards
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
 * The GameProvider component provides a GameContext to its children. It manages the state
 * of the game, including the player's and computer's hands, the play area, the current player,
 * the deck size, the game message, the winner, the number of wins for each player, and whether
 * the round is doubles or singles. It also provides functions to start the game, select and
 * deselect cards, play selected cards, draw a card, and play again. The GameProvider also
 * handles the game logic, such as determining the winner of the game and whether the last move
 * is valid.
 *
 * @function GameProvider
 * @param {React.ReactNode} children React children to be rendered within the GameContext
 * @returns {React.ReactElement} A React element representing the GameProvider component
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
  const [gameMessage, setGameMessage] = useState<string>("");
  const [winner, setWinner] = useState<"player" | "computer" | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerWins, setPlayerWins] = useState(0);
  const [computerWins, setComputerWins] = useState(0);
  const [isDoublesRound, setIsDoublesRound] = useState(false);
  const [roundReset, setRoundReset] = useState(false);

  /**
   * Initializes and starts a new game by creating a shuffled deck, dealing
   * initial hands to the player and the computer, and setting the game to
   * the started state. Resets relevant game states, such as the play area,
   * selected cards, and winner status. Randomly determines which player will
   * take the first turn and sets the game message accordingly.
   */

  const startGame = () => {
    deck = createDeck();
    const initialPlayerHand = deck.splice(0, 2);
    const initialComputerHand = deck.splice(0, 2);

    setPlayerHand(initialPlayerHand);
    setComputerHand(initialComputerHand);
    setDeckSize(42);
    setGameStarted(true);
    setGameMessage("Game started. Player's turn.");
    setWinner(null);
    setPlayArea([]);
    setSelectedCards([]);
    setIsDoublesRound(false);

    if (Math.random() < 0.5) {
      setCurrentPlayer("player");
    } else {
      setCurrentPlayer("computer");
    }
  };

  const selectCard = (card: CardType) => {
    if (selectedCards.length < 2) {
      setSelectedCards((prev) => [...prev, card]);
      setPlayerHand((prev) => prev.filter((c) => c.id !== card.id));
    }
  };

  const deselectCard = (card: CardType) => {
    setSelectedCards((prev) => prev.filter((c) => c.id !== card.id));
    setPlayerHand((prev) => [...prev, card]);
  };

  /**
   * Determines whether a given set of cards is a valid move, given the current
   * state of the game. A valid move is one that either plays a higher card than
   * the last played card(s) in the play area, or plays a card of equal value but
   * higher suit. If the game is in a doubles round, the function ensures that
   * exactly two cards are played. If the game is not in a doubles round, the
   * function ensures that exactly one card is played.
   *
   * @param cards The cards to check for validity
   * @returns true if the cards are a valid move, false otherwise
   */
  const isValidMove = (cards: CardType[]): boolean => {
    if (cards.length === 0 || cards.length > 2) return false;

    // If playing doubles, ensure both cards have the same value
    if (cards.length === 2 && cards[0].value !== cards[1].value) return false;

    // Get the last played card(s) from the play area
    const lastPlayedCards = playArea.slice(-Math.min(playArea.length, 2));

    if (lastPlayedCards.length === 0) return true; // If no cards are in play, any move is valid

    const lastPlayedValue = cardValues[lastPlayedCards[0].value];
    const lastPlayedSuit = suitValues[lastPlayedCards[0].suit];
    const playedValue = cardValues[cards[0].value];
    const playedSuit = suitValues[cards[0].suit];

    // Enforce round rules (single vs. doubles)
    if (isDoublesRound && cards.length === 1) return false;
    if (!isDoublesRound && cards.length === 2) return false;

    // Compare values first
    if (playedValue > lastPlayedValue) return true;

    // If values are equal, compare suits
    return playedValue === lastPlayedValue && playedSuit > lastPlayedSuit;
  };

  /**
   * Plays the selected cards in the play area. If the player is the current player,
   * removes the selected cards from the player's hand and updates the game message
   * accordingly. If the computer is the current player, removes the selected cards
   * from the computer's hand and updates the game message accordingly. If the round
   * is reset, bypasses the validity check and plays the selected cards anyway.
   * Sets the round state after a valid play. If the player or computer has played
   * their last card, updates the game message to indicate that the other player
   * must respond.
   */
  const playSelectedCards = () => {
    if (selectedCards.length === 0) return; // No cards selected

    // Bypass validity check if round is reset
    if (!roundReset && !isValidMove(selectedCards)) {
      setPlayerHand((prev) => [...prev, ...selectedCards]);
      setSelectedCards([]);
      setGameMessage("Invalid move. Please try again.");
      return;
    }

    setPlayArea((prev) => [...prev, ...selectedCards]);

    if (currentPlayer === "player") {
      setPlayerHand((prev) =>
        prev.filter((card) => !selectedCards.includes(card))
      );

      if (playerHand.length - selectedCards.length === 0) {
        setGameMessage(
          "Player has played their last card. Computer must respond!"
        );
      } else {
        setGameMessage("Player played. Computer's turn.");
      }

      setCurrentPlayer("computer");
    } else {
      setComputerHand((prev) =>
        prev.filter((card) => !selectedCards.includes(card))
      );

      if (computerHand.length - selectedCards.length === 0) {
        setGameMessage(
          "Computer has played their last card. Player must respond!"
        );
      } else {
        setGameMessage("Computer played. Player's turn.");
      }

      setCurrentPlayer("player");
    }

    setIsDoublesRound(selectedCards.length === 2);
    setSelectedCards([]);
    setRoundReset(false); // Reset round state after a valid play
  };

  /**
   * Draws a card from the deck and adds it to the current player's hand. If the
   * deck is empty, does nothing. If the player is the current player, sets the
   * game message to indicate that the computer's turn has started. If the
   * computer is the current player, sets the game message to indicate that the
   * player's turn has started. Updates the deck size and current player after
   * drawing a card. Sets the round state to reset after drawing a card.
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
      }
      setDeckSize((prev) => prev - 1);
      setCurrentPlayer(currentPlayer === "player" ? "computer" : "player");
      setIsDoublesRound(false);
      setRoundReset(true);
    }
  };

  /**
   * Executes the computer's turn by attempting to play valid cards from its hand.
   * In a doubles round, the computer will try to play two cards of the same value
   * that are higher than the last played cards. In a singles round, it will play
   * a single card that is higher in value or suit than the last played card.
   * If no valid play is possible, the computer will draw a card from the deck.
   * After playing, the turn is passed to the player, and the game message is updated
   * accordingly. The round state is reset after a valid play.
   */
  const computerPlay = () => {
    if (computerHand.length === 0) return;

    const lastPlayedCards = playArea.slice(-2);
    let playableCards: CardType[] = [];

    const isCardHigher = (card: CardType, lastCard: CardType) => {
      const cardValue = cardValues[card.value];
      const lastCardValue = cardValues[lastCard.value];

      if (cardValue > lastCardValue) return true;
      if (cardValue === lastCardValue)
        return suitValues[card.suit] > suitValues[lastCard.suit];
      return false;
    };

    if (isDoublesRound) {
      for (let i = 0; i < computerHand.length; i++) {
        for (let j = i + 1; j < computerHand.length; j++) {
          if (
            computerHand[i].value === computerHand[j].value &&
            (lastPlayedCards.length === 0 ||
              isCardHigher(computerHand[i], lastPlayedCards[0]))
          ) {
            playableCards = [computerHand[i], computerHand[j]];
            break;
          }
        }
        if (playableCards.length > 0) break;
      }
    } else {
      playableCards = computerHand.filter(
        (card) =>
          roundReset || // Allow any card on round reset
          lastPlayedCards.length === 0 ||
          isCardHigher(card, lastPlayedCards[0])
      );
    }

    if (playableCards.length > 0) {
      const cardsToPlay = isDoublesRound
        ? playableCards.slice(0, 2)
        : [playableCards[0]];
      setComputerHand((prev) => prev.filter((c) => !cardsToPlay.includes(c)));
      setPlayArea((prev) => [...prev, ...cardsToPlay]);
      setGameMessage(
        `Computer played ${cardsToPlay.length} card(s). Player's turn.`
      );
      setIsDoublesRound(cardsToPlay.length === 2);
      setRoundReset(false); // Reset round state after a valid play
    } else {
      drawCard();
    }

    setCurrentPlayer("player");
  };

  const playAgain = () => {
    startGame();
  };

  /**
   * Effect to handle game state updates after player or computer makes a move.
   * Checks if the game has been won and updates the winner and win counts
   * accordingly. Also handles invalid moves by reverting the last play.
   */
  useEffect(() => {
    if (!gameStarted || winner) return;

    const lastPlayer = currentPlayer === "player" ? "computer" : "player";

    if (playerHand.length === 0 && isValidMove(playArea.slice(-1))) {
      setWinner("player");
      setPlayerWins((prev) => prev + 1);
      setGameMessage("Player wins the game!");
    } else if (computerHand.length === 0 && isValidMove(playArea.slice(-1))) {
      setWinner("computer");
      setComputerWins((prev) => prev + 1);
      setGameMessage("Computer wins the game!");
    } else if (
      (playerHand.length === 0 || computerHand.length === 0) &&
      !isValidMove(playArea.slice(-1))
    ) {
      // If the last move is invalid, revert the last play
      if (lastPlayer === "player") {
        setPlayerHand((prev) => [
          ...prev,
          ...playArea.slice(-selectedCards.length),
        ]);
      } else {
        setComputerHand((prev) => [
          ...prev,
          ...playArea.slice(-selectedCards.length),
        ]);
      }
      setPlayArea((prev) => prev.slice(0, -selectedCards.length));
      setGameMessage("Invalid move! Reverting last play.");
    }
  }, [gameStarted, winner, playerHand, computerHand, playArea]);
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
