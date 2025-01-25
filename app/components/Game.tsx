"use client";

import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Hand from "./Hand";
import Deck from "./Deck";
import PlayArea from "./PlayArea";
import ComputerHand from "./ComputerHand";
import { useGameContext, GameProvider, CardType } from "./contexts/GameContext";
import Confetti from "react-confetti";

/**
 * A Dialog component that shows the game’s rules
 * in a scrollable, user-friendly format.
 */
function RulesDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Pusoy Dos Variant – Rules</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" paragraph>
          <strong>Objective:</strong> Be the first player to shed all your
          cards.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Gameplay:</strong> Players take turns playing one card,
          doubles, or a hand of 5 to beat the previous play. If a player
          cannot—or chooses not to—beat the previous play, they must draw a
          card. The player who wins the round can start the next round with any
          allowed card combination.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Deck and Suit Values:</strong> This game uses a standard
          52-card deck. Suits ascend in the order: ♠ (lowest), ♣, ♦, ♥
          (highest). Card ranks ascend 2, 3, 4... 10, J, Q, K, A.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Winning a Round:</strong> A round is won when your opponent
          cannot beat your play. You then start the next round with any card
          combination you want.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Winning the Game:</strong> The first player to shed all of
          their cards is immediately declared the winner.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * The main game component. This component renders the main game UI
 * including the computer hand, play area, player hand, deck, and
 * game controls. The component uses the useGameContext hook to get
 * the game state and update it as needed.
 */
const GameContent: React.FC = () => {
  // State for controlling the visibility of the Rules dialog
  const [rulesOpen, setRulesOpen] = useState(false);

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

  // If both player and computer have 0 cards, game hasn't started yet
  if (playerHand.length === 0 && computerHand.length === 0) {
    return (
      <Card
        sx={{
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          my: 4,
          p: 2,
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(4px)",
        }}
      >
        <CardContent>
          {/* Add Logo in Top-Right */}

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome to PseuDos
            <span style={{ color: "red", fontSize: "30px" }}>❤️</span>
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            The aim of the game is to get rid of all the cards in your hand.
            Good luck!
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button variant="contained" color="primary" onClick={startGame}>
              Start Game
            </Button>
            <Button
              variant="outlined"
              onClick={() => setRulesOpen(true)}
              sx={{ borderColor: "primary.main" }}
            >
              Show Rules
            </Button>
          </Box>
        </CardContent>

        {/* Rules Dialog */}
        <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
      </Card>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Card
        sx={{
          width: "100%",
          maxWidth: "1300px",
          mx: "auto",
          my: 4,
          position: "relative",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Winner Overlay */}
        {winner && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: "4px",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                borderRadius: 2,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <Typography
                variant="h3"
                fontWeight="bold"
                color="white"
                gutterBottom
              >
                {winner === "player" ? "You Win!" : "Computer Wins!"}
              </Typography>
              <Typography variant="h5" color="white" gutterBottom>
                Congratulations!
              </Typography>
              <Button variant="contained" onClick={playAgain}>
                Play Again
              </Button>
            </Box>
            <Confetti />
          </Box>
        )}

        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
              gap: "1.5rem",
            }}
          >
            {/* Left Column: ComputerHand, PlayArea, PlayerHand */}
            <Box>
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
            </Box>

            {/* Right Column: Deck, Draw/Play Buttons, Stats */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                mt: 20,
              }}
            >
              {/* LOGO */}
              <Typography
                sx={{
                  left: "10px",
                  fontSize: "20px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "regular",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#4e4e4e",
                }}
              >
                PseuDos
                <span style={{ color: "red", fontSize: "18px" }}>❤️</span>
              </Typography>

              {/* Deck to draw cards from */}
              <Deck cardsLeft={deckSize} />

              <Button
                variant="contained"
                color="secondary"
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
                variant="contained"
                onClick={playSelectedCards}
                disabled={
                  currentPlayer !== "player" ||
                  selectedCards.length === 0 ||
                  winner !== null
                }
              >
                Play Card{selectedCards.length === 2 ? "s" : ""}
              </Button>

              <Typography variant="subtitle1" fontWeight="bold">
                Current Player: {currentPlayer}
              </Typography>
              <Typography variant="body2">{gameMessage}</Typography>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body1">
                  Player Wins: {playerWins}
                </Typography>
                <Typography variant="body1">
                  Computer Wins: {computerWins}
                </Typography>
              </Box>

              {/* Show Rules button on the right column as well */}
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setRulesOpen(true)}
              >
                Show Rules
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Rules Dialog */}
      <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </DndProvider>
  );
};

const Game: React.FC = () => (
  <GameProvider>
    <GameContent />
  </GameProvider>
);

export default Game;
