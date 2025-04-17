import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Card as MUICard, CardContent, Typography, Box } from "@mui/material";
import { CardType } from "./contexts/GameContext";

interface CardProps {
  card: CardType;
  onSelectCard: (card: CardType) => void;
  disabled: boolean;
  isSelected: boolean;
  isPlayerTurn: boolean;
}

/**
 * A Card component that is draggable and clickable. When clicked, it
 * calls the onSelectCard callback with the card object as an argument.
 * The component also displays the card's value and suit, and renders
 * differently depending on whether the card is selected, disabled, or
 * being dragged.
 *
 * @function Card
 * @param {CardType} card The card object to be rendered.
 * @param {(card: CardType) => void} onSelectCard The callback to be called when the card is clicked.
 * @param {boolean} disabled Whether the card should be rendered in a disabled state.
 * @param {boolean} isSelected Whether the card should be rendered in a selected state.
 * @returns {React.ReactElement} A React element representing the Card component.
 */
const DraggableCard: React.FC<CardProps> = ({
  card,
  onSelectCard,
  disabled,
  isSelected,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "card",
    item: card,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const divRef = useRef<HTMLDivElement>(null);

  const color = card.suit === "♥" || card.suit === "♦" ? "red" : "black";

  return (
    <MUICard
      ref={(node) => {
        divRef;
        drag(node);
      }}
      onClick={() => !disabled && onSelectCard(card)}
      sx={{
        width: { xs: 64, sm: 80 },
        height: { xs: 96, sm: 112 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        border: isSelected ? "3px solid gold" : "none",
        opacity: isDragging ? 0.5 : 1,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: !disabled ? "translateY(-4px)" : "none",
          boxShadow: !disabled ? 4 : "none",
        },
      }}
    >
      <CardContent sx={{ textAlign: "center", p: 0 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color }}>
          {card.value}
          {card.suit}
        </Typography>
      </CardContent>
    </MUICard>
  );
};

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
      }}
    >
      <Typography 
        variant="h6" 
        fontWeight="bold" 
        color={"inherit"}
        sx={{ alignSelf: "flex-start" }}
      >
        Your Hand
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
