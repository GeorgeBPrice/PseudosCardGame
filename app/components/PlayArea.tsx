import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { Card as MUICard, CardContent, Typography, Box } from "@mui/material";
import { CardType } from "./contexts/GameContext";
import { isValidStraight, isValidTriplePlusTwo } from "./contexts/GameRules";

interface PlayAreaProps {
  playedCards: CardType[];
  selectedCards: CardType[];
  onDeselectCard: (card: CardType) => void;
  onPlayCard: (card: CardType) => void;
  isDoublesRound: boolean;
  isFiveCardRound: boolean;
  currentPlayer: "player" | "computer";
  gameMessage: string;
}

/**
 * The PlayArea component represents the area where cards are played
 * in the game. It displays the currently played cards and allows for
 * cards to be played by dragging and dropping. If in a doubles round,
 * it indicates so in the display. The component also allows for selected
 * cards to be deselected by clicking on them.
 */
const PlayArea: React.FC<PlayAreaProps> = ({
  playedCards,
  selectedCards,
  onDeselectCard,
  onPlayCard,
  isDoublesRound,
  isFiveCardRound,
  currentPlayer,
  gameMessage,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "card",
    drop: (item: CardType) => {
      onPlayCard(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const divRef = useRef<HTMLDivElement>(null);

  // Function to format a card for display
  const formatCard = (card: CardType) => `${card.value}${card.suit}`;

  // Function to get the last move cards
  const getLastMoveCards = () => {
    if (playedCards.length === 0) return [];
    
    // Get the last move based on the number of cards
    const lastMoveLength = playedCards.length;
    
    // Check if the last 5 cards form a valid 5-card combination
    if (lastMoveLength >= 5) {
      const lastFive = playedCards.slice(-5);
      if (isValidStraight(lastFive) || isValidTriplePlusTwo(lastFive)) {
        return lastFive;
      }
    }
    
    // Check if the last 2 cards are a pair
    if (lastMoveLength >= 2) {
      const lastTwo = playedCards.slice(-2);
      if (lastTwo[0].value === lastTwo[1].value) {
        return lastTwo;
      }
    }
    
    // Default to showing the last single card
    return playedCards.slice(-1);
  };

  // Function to get the breadcrumb items
  const getBreadcrumbItems = () => {
    const items: string[] = [];
    let i = 0;
    
    while (i < playedCards.length) {
      // Always treat each card as a separate move
      items.push(formatCard(playedCards[i]));
      i += 1;
    }
    
    return items;
  };

  return (
    <MUICard
      sx={{
        width: "100%",
        height: "24rem",
        backgroundImage:
          "linear-gradient(180deg, #fdf9ff  100%, #edeeff  100%)",
        marginBottom: "1rem",
        transition: "background-color 0.3s",
        borderRadius: "1rem",
        border: "2px solid",
        borderStyle: "dashed",
        borderColor: "#bbbeff",
        position: "relative",
      }}
    >
      <CardContent
        ref={(node) => {
          divRef;
          drop(node);
        }}
        sx={{
          height: "100%",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
        }}
      >
        {/* Breadcrumb for previous moves */}
        <Box
          sx={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            width: "70%",
            maxHeight: "3rem",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "2rem",
              height: "100%",
              background: "linear-gradient(to right, rgba(253, 249, 255, 1), rgba(253, 249, 255, 0))",
              zIndex: 1,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              paddingLeft: "2rem",
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            {getBreadcrumbItems().map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  "&:not(:last-child)::after": {
                    content: '">"',
                    margin: "0 0.5rem",
                    color: "#666",
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666",
                    fontSize: "1.1rem",
                    "& .suit": {
                      fontSize: "1.3rem",
                      verticalAlign: "middle",
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: item.replace(/([♠♣♦♥])/, '<span class="suit">$1</span>')
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Game message in top right */}
        <Box
          sx={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            boxShadow: 1,
          }}
        >
          <Typography variant="body2">
            {gameMessage.replace("Player's turn.", "").replace("Computer's turn.", "")}
          </Typography>
        </Box>

        {/* Turn indicator in bottom right */}
        <Box
          sx={{
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            boxShadow: 1,
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: currentPlayer === "player" ? "#4e54c8" : "inherit",
              fontWeight: currentPlayer === "player" ? "bold" : "normal"
            }}
          >
            Turn: {currentPlayer === "player" ? "Yours" : "Computer"}
          </Typography>
        </Box>

        {/* Last move cards */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {isFiveCardRound && (
            <Typography variant="h6" color="primary" fontWeight="bold">
              Five Card Hand
            </Typography>
          )}
          {isDoublesRound && (
            <Typography variant="h6" color="primary" fontWeight="bold">
              Doubles
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {getLastMoveCards().map((card) => {
              const color = card.suit === "♥" || card.suit === "♦" ? "red" : "black";
              return (
                <MUICard
                  key={card.id}
                  sx={{
                    width: { xs: 64, sm: 80 },
                    height: { xs: 96, sm: 112 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid",
                    borderColor: "blue",
                    transition: "transform 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 0, textAlign: "center" }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color }}>
                      {card.value}
                      {card.suit}
                    </Typography>
                  </CardContent>
                </MUICard>
              );
            })}
          </Box>
        </Box>

        {/* Display currently selected cards */}
        {selectedCards.length > 0 && (
          <Box sx={{ marginTop: "2rem", textAlign: "center" }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              You are playing:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {selectedCards.map((card) => {
                const color = card.suit === "♥" || card.suit === "♦" ? "red" : "black";
                return (
                  <MUICard
                    key={card.id}
                    onClick={() => onDeselectCard(card)}
                    sx={{
                      width: { xs: 64, sm: 80 },
                      height: { xs: 96, sm: 112 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid gold",
                      cursor: "pointer",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 0, textAlign: "center" }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color }}>
                        {card.value}
                        {card.suit}
                      </Typography>
                    </CardContent>
                  </MUICard>
                );
              })}
            </Box>
          </Box>
        )}
      </CardContent>
    </MUICard>
  );
};

export default PlayArea;
