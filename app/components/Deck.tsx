import { Card, CardContent } from "@/app/components/ui/card";

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
    <div className="relative w-16 h-24 sm:w-20 sm:h-28 pt-8">
      <Card className="absolute inset-0 bg-primary">
        <CardContent className="flex items-center justify-center h-full">
          <span className="text-lg font-bold text-primary-foreground">
            {cardsLeft}
          </span>
        </CardContent>
      </Card>
      <div className="absolute inset-0 border-2 border-primary-foreground rounded-md transform -rotate-6"></div>
      <div className="absolute inset-0 border-2 border-primary-foreground rounded-md transform rotate-3"></div>
    </div>
  );
}
