import React from "react";
import {
  Card as MUICard,
  CardContent as MUICardContent,
  Typography,
} from "@mui/material";

interface CardProps {
  card: {
    value: string;
    suit: string;
  };
}

/**
 * Renders a single playing card with its value and suit.
 * Depending on the suit, the card’s text color is styled red or black.
 * This is the core UI for each card in the deck/player hand.
 */
export default function Card({ card }: CardProps) {
  const { value, suit } = card;
  const color = suit === "♥" || suit === "♦" ? "red" : "black";

  return (
    <MUICard
      /* 
        We add some styling for size and hover effect with MUI’s sx prop:
      */
      sx={{
        width: { xs: 64, sm: 80 },
        height: { xs: 96, sm: 112 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <MUICardContent
        sx={{
          p: 0,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          component="span"
          fontWeight="bold"
          sx={{ color }}
        >
          {value}
          {suit}
        </Typography>
      </MUICardContent>
    </MUICard>
  );
}
