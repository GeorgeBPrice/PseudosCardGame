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
import {
  useGameContext,
  GameProvider,
  CardType,
  isValidStraight,
} from "./contexts/GameContext";
import Confetti from "react-confetti";

/**
 * A Dialog component that shows the game's rules
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
      <DialogTitle>PseuDos – Rules</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" paragraph>
          <strong>Objective:</strong> Be the first player to shed all your cards.
        </Typography>

        <Typography variant="h6" gutterBottom>Card Play Types:</Typography>
        
        <Typography variant="body1" paragraph>
          <strong>Single Card:</strong> Play one card to beat the previous play. Higher value wins, and if values are equal, higher suit wins (&spades; &lt; &clubs; &lt; &diams; &lt; &hearts;).
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Doubles:</strong> Play two cards of the same value (e.g., 7&spades; & 7&diams;). The higher value pair wins. If values are equal, the higher suit of the highest card wins.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>5-Card Half Suit:</strong> Play five cards of the same suit in sequence (e.g., 3&hearts;, 4&hearts;, 5&hearts;, 6&hearts;, 7&hearts;). The highest card in the sequence determines the strength.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>5-Card Half House:</strong> Play three cards of one value and two cards of another value (e.g., 7&spades;, 7&diams;, 7&hearts;, 2&clubs;, 2&hearts;). The value of the three-of-a-kind determines the strength.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Gameplay:</strong> Players take turns playing one of the above combinations to beat the previous play. If you cannot—or choose not to—beat the previous play, you must draw a card. The player who wins the round can start the next round with any allowed combination.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Winning:</strong> The first player to shed all of their cards is immediately declared the winner.
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
  const [errorMessage, setErrorMessage] = useState("");

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
    isFiveCardRound,
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
  };

  const handlePlaySelectedCards = () => {
    // Validate the selected cards before playing
    if (
      selectedCards.length === 2 &&
      selectedCards[0].value !== selectedCards[1].value
    ) {
      setErrorMessage("Doubles must be of the same value (ex, 7 & 7)");
      return;
    }

    if (selectedCards.length === 5) {
      const isTriplePlusTwo = selectedCards.some(
        (card) =>
          selectedCards.filter((c) => c.value === card.value).length === 3
      );
      const isStraight = isValidStraight(selectedCards);

      if (!isTriplePlusTwo && !isStraight) {
        setErrorMessage(
          "5 cards must be either a straight or three of a kind plus two random cards"
        );
        return;
      }
    }

    setErrorMessage("");
    playSelectedCards();
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
          maxWidth: "1200px",
          mx: "auto",
          my: 4,
          position: "relative",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(4px)",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Logo */}
        <Typography
          sx={{
            position: "absolute",
            top: { xs: 6, sm: 10, md: 15 },
            right: { xs: 20, sm: 40, md: 90 },
            fontSize: { xs: "16px", sm: "18px", md: "20px" },
            fontFamily: "'Poppins', sans-serif",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: { xs: "2px", sm: "3px", md: "4px" },
            background: "linear-gradient(45deg,rgb(84, 46, 208) 30%,rgb(103, 0, 163) 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0px 2px 4px rgba(0,0,0,0.1)",
            "& span": {
              color: "red",
              fontSize: { xs: "14px", sm: "16px", md: "20px" },
              textShadow: "0px 2px 4px rgba(0,0,0,0.2)",
            }
          }}
        >
          PseuDos
          <span>❤️</span>
        </Typography>

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

        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "4fr 1fr" },
              gap: { xs: 2, sm: 3, md: 4 },
              width: "100%",
              maxWidth: "100%",
              margin: "0 auto",
            }}
          >
            {/* Main Game Area */}
            <Box sx={{ 
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0",
              padding: "1rem",
              maxWidth: "100%",
              overflow: "hidden",
            }}>
              {/* Player's Hand */}
              <Hand
                cards={playerHand}
                onSelectCard={handlePlayCard}
                onDeselectCard={deselectCard}
                selectedCards={selectedCards}
                disabled={currentPlayer !== "player" || winner !== null}
                isFiveCardRound={isFiveCardRound}
                isPlayerTurn={currentPlayer === "player"}
              />

              {/* Mobile Action Buttons */}
              <Box sx={{ 
                display: { xs: "flex", md: "none" },
                flexDirection: "column",
                gap: 1,
                mb: 1,
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                padding: 1,
                borderRadius: 2,
              }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handlePlaySelectedCards}
                    disabled={
                      currentPlayer !== "player" ||
                      selectedCards.length === 0 ||
                      selectedCards.length === 3 ||
                      selectedCards.length === 4 ||
                      winner !== null
                    }
                    fullWidth
                  >
                    Play Card
                    {selectedCards.length === 2
                      ? "s (2)"
                      : selectedCards.length > 2 && selectedCards.length < 5
                      ? "s (?)"
                      : selectedCards.length === 5
                      ? "s (5)"
                      : ""}
                  </Button>

                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={drawCard}
                    disabled={
                      currentPlayer !== "player" ||
                      deckSize === 0 ||
                      winner !== null
                    }
                    fullWidth
                  >
                    Draw Card
                  </Button>
                </Box>

                {errorMessage && (
                  <Typography 
                    color="error" 
                    variant="body2" 
                    sx={{ 
                      textAlign: "center",
                      fontSize: "0.8rem",
                      mt: 0.5
                    }}
                  >
                    {errorMessage}
                  </Typography>
                )}
              </Box>

              {/* Play Area */}
              <PlayArea
                playedCards={playArea}
                selectedCards={selectedCards}
                onDeselectCard={deselectCard}
                onPlayCard={handlePlayCard}
                isDoublesRound={isDoublesRound}
                isFiveCardRound={isFiveCardRound}
                currentPlayer={currentPlayer}
                gameMessage={gameMessage}
              />

              {/* Computer's Hand */}
              <ComputerHand cardCount={computerHand.length} />
            </Box>

            {/* Right Column: Deck, Draw/Play Buttons, Stats */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                mt: { xs: 2, md: 20 },
                width: "100%",
                margin: { xs: "0 auto", md: "0" },
                px: { xs: 1, sm: 2 },
                position: { xs: "relative", md: "sticky" },
                top: { md: "10.5rem" },
                pt: { md: "25rem" },
                justifyContent: "flex-start",
                alignSelf: "flex-start",
                maxWidth: { xs: "100%", sm: "200px" },
                backgroundColor: { md: "rgba(255, 255, 255, 0.5)" },
                borderRadius: { md: "1rem" },
                p: { md: 2 },
              }}
            >
              <Button
                variant="contained"
                onClick={handlePlaySelectedCards}
                disabled={
                  currentPlayer !== "player" ||
                  ![1, 2, 5].includes(selectedCards.length) ||
                  winner !== null
                }
                sx={{ 
                  display: { xs: "none", md: "block" },
                  marginBottom: "1rem",
                  backgroundColor: "#2E8B57",
                  "&:hover": {
                    backgroundColor: "#3CB371",
                  },
                }}
              >
                Play Card
                {selectedCards.length === 2
                  ? "s (2)"
                  : selectedCards.length > 2 && selectedCards.length < 5
                  ? "s (?)"
                  : selectedCards.length === 5
                  ? "s (5)"
                  : ""}
              </Button>

              {errorMessage && (
                <Typography color="error" variant="body2" sx={{ ml: 1, mt: -3 }}>
                  {errorMessage}
                </Typography>
              )}

              {/* Deck to draw cards from */}
              <Deck 
                cardsLeft={deckSize} 
                onClick={drawCard}
                disabled={
                  currentPlayer !== "player" ||
                  deckSize === 0 ||
                  winner !== null
                }
              />

              <Button
                variant="contained"
                color="secondary"
                onClick={drawCard}
                disabled={
                  currentPlayer !== "player" ||
                  deckSize === 0 ||
                  winner !== null
                }
                sx={{ 
                  display: { xs: "none", md: "block" },
                  backgroundColor: "salmon",
                  "&:hover": {
                    backgroundColor: "#ff8c7a",
                  },
                }}
              >
                Draw Card
              </Button>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body1">
                  Your Wins: {playerWins}
                </Typography>
                <Typography variant="body1">
                  AI Wins: {computerWins}
                </Typography>
              </Box>

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
