import React from "react";
import { Card, CardContent } from "@/app/components/ui/card";

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
    <div className="mb-4">
      <h2 className="text-lg font-bold mb-2">Computer's Hand</h2>
      <div className="flex justify-center gap-2">
        {Array.from({ length: cardCount }).map((_, index) => (
          <Card key={index} className="w-12 h-16 bg-primary">
            <CardContent className="p-0 flex items-center justify-center h-full">
              <span className="text-primary-foreground">?</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
