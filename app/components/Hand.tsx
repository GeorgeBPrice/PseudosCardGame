import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { Box, Typography } from "@mui/material";
import { CardType } from "./contexts/GameContext";
import DraggableCard from "./DraggableCard";

interface HandProps {
  cards: CardType[];
  onSelectCard: (card: CardType) => void;
  onDeselectCard: (card: CardType) => void;
  selectedCards: CardType[];
  disabled: boolean;
  isFiveCardRound: boolean;
  isPlayerTurn: boolean;
}

const Hand: React.FC<HandProps> = ({
  cards,
  onSelectCard,
  onDeselectCard,
  selectedCards,
  disabled,
  isFiveCardRound,
  isPlayerTurn,
}) => {
  const [, drop] = useDrop(() => ({
    accept: "card",
    drop: (item: CardType) => {
      const card = selectedCards.find((c) => c.id === item.id);
      if (card) {
        onDeselectCard(card);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handRef = useRef<HTMLDivElement>(null);

  return (
    <Box sx={{ 
      marginBottom: "1rem",
      display: "flex",
      gap: "1rem",
      padding: "1rem",
      border: "2px solid",
      borderColor: isPlayerTurn ? "#90EE90" : "rgba(0, 0, 0, 0.12)",
      borderRadius: "1rem",
      backgroundColor: isPlayerTurn ? "rgba(144, 238, 144, 0.1)" : "transparent",
      transition: "all 0.3s",
      animation: isPlayerTurn ? "shake 0.5s" : "none",
      "@keyframes shake": {
        "0%": { transform: "translateX(0)" },
        "25%": { transform: "translateX(-1px)" },
        "50%": { transform: "translateX(1px)" },
        "75%": { transform: "translateX(-1px)" },
        "100%": { transform: "translateX(0)" },
      },
    }}>
      {/* Vertical Label */}
      <Box sx={{
        width: "5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(144, 238, 144, 0.2)",
        borderRadius: "0.5rem",
        border: "1px solid",
        borderColor: isPlayerTurn ? "#90EE90" : "rgba(0, 0, 0, 0.12)",
      }}>
        <Typography 
          variant="h6" 
          fontWeight="bold"
          sx={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            textAlign: "center",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            color: isPlayerTurn ? "#2E7D32" : "inherit",
          }}
        >
          Your Hand
        </Typography>
      </Box>

      {/* Cards Container */}
      <Box sx={{ 
        flex: 1,
        display: "flex", 
        flexWrap: "wrap",
        justifyContent: "center", 
        gap: "0.5rem",
        maxWidth: "100%",
      }}>
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            onSelectCard={onSelectCard}
            disabled={disabled}
            isSelected={selectedCards.includes(card)}
            isPlayerTurn={isPlayerTurn}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Hand;
