import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface DeckProps {
  cardsLeft: number;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * A component that displays a deck of cards with a count of cards left.
 *
 * @param {object} props The component's props.
 * @param {number} props.cardsLeft The number of cards left in the deck.
 * @param {function} props.onClick The function to call when the deck is clicked.
 * @param {boolean} props.disabled Whether the deck is disabled.
 * @returns {JSX.Element} The rendered component.
 */
const Deck: React.FC<DeckProps> = ({ cardsLeft, onClick, disabled }) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: 40, sm: 48, md: 64 },
        height: { xs: 60, sm: 72, md: 96 },
        cursor: disabled ? "default" : "pointer",
        "&:hover": {
          transform: disabled ? "none" : "translateY(-4px)",
          transition: "transform 0.2s",
        },
      }}
      onClick={disabled ? undefined : onClick}
    >
      <Card
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "primary.contrastText",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <CardContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography
            variant="h5"
            component="span"
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
            }}
          >
            {cardsLeft}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.7rem" },
              textAlign: "center",
            }}
          >
            cards left
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
};

export default Deck;
