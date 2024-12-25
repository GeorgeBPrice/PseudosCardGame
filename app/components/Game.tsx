"use client";

import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import Hand from "./Hand";
import Deck from "./Deck";
import PlayArea from "./PlayArea";
import ComputerHand from "./ComputerHand";
import { useGameContext, GameProvider, CardType } from "./contexts/GameContext";
import Confetti from "react-confetti";

/**
 * The main game component. This component renders the main game UI including the computer hand, play area, player hand, deck, and game controls.
 * The component is wrapped in a DndProvider so that drag-and-drop functionality can be used throughout the game.
 * The component uses the useGameContext hook to get the game state and the various functions for updating the game state.
 * The component also uses the useEffect hook to start the computer player's turn when the game is in the computer player's turn.
 */
const GameContent: React.FC = () => {
  const {
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
  } = useGameContext();

  useEffect(() => {
    if (currentPlayer === "computer") {
      const timer = setTimeout(() => {
        computerPlay();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, computerPlay]);

  const handlePlayCard = (card: CardType) => {
    selectCard(card);
    if (selectedCards.length === 1 || isDoublesRound) {
      playSelectedCards();
    }
  };

  if (playerHand.length === 0 && computerHand.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto my-8">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Psuedos!</h2>
          <p className="text-lg mb-4">
            The aim of the game is to get rid of all the cards in your hand.
            Good luck!
          </p>
          <Button onClick={startGame}>Start Game</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="w-full max-w-4xl mx-auto my-8 relative">
        {winner && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center  bg-black bg-opacity-70 p-8 rounded-md">
              <h2 className="text-4xl font-bold text-white mb-4">
                {winner === "player" ? "You Win!" : "Computer Wins!"}
              </h2>
              <p className="text-xl text-white mb-4">Congratulations!</p>
              <Button onClick={playAgain}>Play Again</Button>
            </div>
            <Confetti />
          </div>
        )}
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ComputerHand cardCount={computerHand.length} />
              <PlayArea
                playedCards={playArea}
                selectedCards={selectedCards}
                onDeselectCard={deselectCard}
                onPlayCard={handlePlayCard}
                isDoublesRound={isDoublesRound}
              />
              <Hand
                cards={playerHand}
                onSelectCard={selectCard}
                onDeselectCard={deselectCard}
                selectedCards={selectedCards}
                disabled={currentPlayer !== "player" || winner !== null}
              />
            </div>
            <div className="flex flex-col items-center gap-4 pt-40">
              <Deck cardsLeft={deckSize} />
              <Button
                onClick={drawCard}
                disabled={
                  currentPlayer !== "player" ||
                  deckSize === 0 ||
                  winner !== null
                }
              >
                Draw Card
              </Button>
              <Button
                onClick={playSelectedCards}
                disabled={
                  currentPlayer !== "player" ||
                  selectedCards.length === 0 ||
                  winner !== null
                }
              >
                Play Card{selectedCards.length === 2 ? "s" : ""}
              </Button>
              <p className="text-lg font-semibold">
                Current Player: {currentPlayer}
              </p>
              <p className="text-md">{gameMessage}</p>
              <div className="mt-4">
                <p>Player Wins: {playerWins}</p>
                <p>Computer Wins: {computerWins}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DndProvider>
  );
};

const Game: React.FC = () => (
  <GameProvider>
    <GameContent />
  </GameProvider>
);

export default Game;
