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

  // Function to get the last hand played
  const getLastHand = () => {
    if (playedCards.length === 0) return [];
    
    // Start from the end and work backwards to find the last complete hand
    let i = playedCards.length - 1;
    
    // If it's a five card round, return the last 5 cards
    if (isFiveCardRound && i >= 4) {
      return playedCards.slice(i - 4, i + 1);
    }
    
    // If it's a doubles round, return the last 2 cards
    if (isDoublesRound && i >= 1) {
      return playedCards.slice(i - 1, i + 1);
    }
    
    // If it's a single card round, return the last card
    return [playedCards[i]];
  };

  // Function to get the history of hands played
  const getHandHistory = () => {
    const history: { cards: CardType[], type: 'single' | 'double' | 'five' }[] = [];
    let i = 0;
    
    while (i < playedCards.length) {
      // Check for 5-card hand
      if (i + 5 <= playedCards.length) {
        const potentialFive = playedCards.slice(i, i + 5);
        if (isValidStraight(potentialFive) || isValidTriplePlusTwo(potentialFive)) {
          history.push({ cards: potentialFive, type: 'five' });
          i += 5;
          continue;
        }
      }
      
      // Check for double
      if (i + 2 <= playedCards.length) {
        const potentialDouble = playedCards.slice(i, i + 2);
        if (potentialDouble[0].value === potentialDouble[1].value) {
          history.push({ cards: potentialDouble, type: 'double' });
          i += 2;
          continue;
        }
      }
      
      // Default to single
      history.push({ cards: [playedCards[i]], type: 'single' });
      i += 1;
    }
    
    return history;
  };

  return (
    <MUICard
      sx={{
        width: "100%",
        height: { xs: "18rem", sm: "20rem", md: "24rem" },
        backgroundImage:
          "linear-gradient(180deg, #fdf9ff  100%, #edeeff  100%)",
        marginBottom: "1rem",
        transition: "background-color 0.3s",
        borderRadius: "1rem",
        border: "2px solid",
        borderStyle: "dashed",
        borderColor: "#bbbeff",
        position: "relative",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <CardContent
        ref={(node) => {
          divRef;
          drop(node);
        }}
        sx={{
          height: "100%",
          padding: { xs: "0.75rem", sm: "1rem" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
        }}
      >
        {/* Breadcrumb for previous hands */}
        <Box
          sx={{
            position: "absolute",
            top: "0.5rem",
            left: "1rem",
            width: { xs: "60%", sm: "70%" },
            maxHeight: "2rem",
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
              gap: "0.25rem",
              alignItems: "center",
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              paddingLeft: "0.5rem",
              width: "100%",
              justifyContent: "flex-start",
            }}
          >
            {playedCards.slice(-10).map((card, index, array) => (
              <React.Fragment key={index}>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666",
                    fontSize: "0.9rem",
                    "& .suit": {
                      fontSize: "1.1rem",
                      verticalAlign: "middle",
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatCard(card).replace(/([♠♣♦♥])/g, '<span class="suit">$1</span>')
                  }}
                />
                {index < array.length - 1 && (
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#666",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      "&::before": {
                        content: '"•"',
                        margin: "0 0.1rem",
                      },
                    }}
                  />
                )}
              </React.Fragment>
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

        {/* Last hand played */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {isFiveCardRound && (
            <Typography variant="h6" color="primary" fontWeight="bold" fontSize={"1.0rem"} margin={"1.5em 0 -0.5em"}>
              Five Card Hand
            </Typography>
          )}
          {isDoublesRound && (
            <Typography variant="h6" color="primary" fontWeight="bold" fontSize={"1.0rem"} margin={"1.5em 0 -0.5em"}>
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
            {getLastHand().map((card) => {
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
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom margin={"-1.0em 0 0.25em"}>
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
