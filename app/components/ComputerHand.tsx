import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

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
    <Box sx={{ 
      marginBottom: "1rem",
      display: "flex",
      gap: "1rem",
      padding: "1rem",
      border: "2px solid",
      borderColor: "primary.main",
      borderRadius: "1rem",
      backgroundColor: "rgba(25, 118, 210, 0.05)",
    }}>
      {/* Vertical Label */}
      <Box sx={{
        width: "5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(25, 118, 210, 0.1)",
        borderRadius: "0.5rem",
        border: "1px solid",
        borderColor: "primary.main",
      }}>
        <Typography 
          variant="h6" 
          fontWeight="bold"
          sx={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            textAlign: "center",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            color: "primary.dark",
          }}
        >
          A.I. Hand
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
        {Array.from({ length: cardCount }).map((_, index) => (
          <Card
            key={index}
            sx={{
              width: { xs: 40, sm: 48, md: 64 },
              height: { xs: 60, sm: 72, md: 96 },
              backgroundColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.contrastText",
              flexShrink: 0,
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
              <Typography 
                variant="h5" 
                component="span"
                sx={{
                  fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" }
                }}
              >
                ?
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
