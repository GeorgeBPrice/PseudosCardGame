import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface DeckProps {
  cardsLeft: number;
}

/**
 * A component that displays a deck of cards with a count of cards left.
 *
 * @param {object} props The component's props.
 * @param {number} props.cardsLeft The number of cards left in the deck.
 * @returns {JSX.Element} The rendered component.
 */
export default function Deck({ cardsLeft }: DeckProps) {
  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: 64, sm: 80 },
        height: { xs: 96, sm: 112 },
        paddingTop: "2rem",
      }}
    >
      <Card
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          transition: "transform 0.3s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 4,
          },
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {cardsLeft}
          </Typography>
        </CardContent>
      </Card>

      {/* Overlapping “border” layers for a stacked deck look */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          border: "2px solid",
          borderColor: "primary.contrastText",
          borderRadius: "4px",
          transform: "rotate(-6deg)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          border: "2px solid",
          borderColor: "primary.contrastText",
          borderRadius: "4px",
          transform: "rotate(3deg)",
        }}
      />
    </Box>
  );
}
