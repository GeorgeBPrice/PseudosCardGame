import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface ComputerHandProps {
  cardCount: number;
}

/**
 * Renders the computer's hand in the card game interface.
 * Displays a specified number of face-down cards to represent
 * the computer's current hand. Each card is represented by a
 * question mark and styled with a primary background.
 *
 * @param {Object} props - The properties object.
 * @param {number} props.cardCount - The number of cards to display.
 */
export default function ComputerHand({ cardCount }: ComputerHandProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Computer’s Hand
      </Typography>
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
        {Array.from({ length: cardCount }).map((_, index) => (
          <Card
            key={index}
            sx={{
              width: { xs: 48, sm: 64 },
              height: { xs: 72, sm: 96 },
              backgroundColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.contrastText",
            }}
          >
            <CardContent
              sx={{
                p: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="h5" component="span">
                ?
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
