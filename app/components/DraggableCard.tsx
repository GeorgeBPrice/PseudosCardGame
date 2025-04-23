import React from "react";
import { Card as MUICard, CardContent, Typography } from "@mui/material";
import { useDrag } from "react-dnd";
import { CardType } from "./contexts/GameContext";

interface DraggableCardProps {
  card: CardType;
  onSelectCard: (card: CardType) => void;
  disabled: boolean;
  isSelected: boolean;
  isPlayerTurn: boolean;
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  onSelectCard,
  disabled,
  isSelected,
  isPlayerTurn,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "card",
    item: card,
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [card, disabled]);

  const color = card.suit === "♥" || card.suit === "♦" ? "red" : "black";

  return (
    <div ref={drag as any} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <MUICard
        onClick={() => onSelectCard(card)}
        sx={{
          width: { xs: 40, sm: 48, md: 64 },
          height: { xs: 60, sm: 72, md: 96 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid",
          borderColor: isSelected ? "gold" : "blue",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: disabled ? "none" : "translateY(-4px)",
            boxShadow: disabled ? "none" : 4,
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
    </div>
  );
};

export default DraggableCard; 