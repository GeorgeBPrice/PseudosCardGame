import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { Card as MUICard, CardContent, Typography } from "@mui/material";
import { CardType } from "./contexts/GameContext";

interface PlayAreaProps {
  playedCards: CardType[];
  selectedCards: CardType[];
  onDeselectCard: (card: CardType) => void;
  onPlayCard: (card: CardType) => void;
  isDoublesRound: boolean;
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
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {playedCards.length === 0 ? "Play a Card" : "Cards in Play"}{" "}
          {isDoublesRound && "(Doubles Round)"}
        </Typography>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {playedCards.slice(-2).map((card, index) => {
            const color =
              card.suit === "♥" || card.suit === "♦" ? "red" : "black";
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
                  borderColor: index % 2 === 0 ? "blue" : "red",
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
        </div>

        {/* Display currently selected cards (the ones about to be played) */}
        {selectedCards.length > 0 && (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              You are playing:
            </Typography>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {selectedCards.map((card) => {
                const color =
                  card.suit === "♥" || card.suit === "♦" ? "red" : "black";
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
            </div>
          </div>
        )}
      </CardContent>
    </MUICard>
  );
};

export default PlayArea;
