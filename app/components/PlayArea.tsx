import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { Card as CardUI, CardContent } from "@/app/components/ui/card";
import { CardType } from "./contexts/GameContext";

interface PlayAreaProps {
  playedCards: CardType[];
  selectedCards: CardType[];
  onDeselectCard: (card: CardType) => void;
  onPlayCard: (card: CardType) => void;
  isDoublesRound: boolean;
}

/**
 * The PlayArea component represents the area where cards are played
 * in the game. It displays the currently played cards and allows for
 * cards to be played by dragging and dropping. If in a doubles round,
 * it indicates so in the display. The component also allows for selected
 * cards to be deselected by clicking on them.
 */
const PlayArea: React.FC<PlayAreaProps> = ({
  playedCards,
  selectedCards,
  onDeselectCard,
  onPlayCard,
  isDoublesRound,
}) => {
  const [, drop] = useDrop(() => ({
    accept: "card",
    drop: (item: CardType) => {
      onPlayCard(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const divRef = useRef<HTMLDivElement>(null);

  return (
    <CardUI className="w-full h-96 bg-green-100 mb-4">
      <CardContent
        className="h-full p-4 flex flex-col justify-center items-center overflow-y-auto"
        ref={(node) => {
          divRef;
          drop(node);
        }}
      >
        <h2 className="text-lg font-bold mb-2">
          {playedCards.length === 0 ? "Play a Card" : "Cards in Play"}
          {isDoublesRound && " (Doubles Round)"}
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-2">
          {playedCards.slice(-2).map((card, index) => (
            <CardUI
              key={card.id}
              className={`w-16 h-24 sm:w-20 sm:h-28 flex items-center justify-center ${
                index % 2 === 0 ? "border-blue-500" : "border-red-500"
              } border-2`}
            >
              <CardContent
                className={`text-2xl font-bold ${
                  card.suit === "♥" || card.suit === "♦"
                    ? "text-red-500"
                    : "text-black"
                }`}
              >
                {card.value}
                {card.suit}
              </CardContent>
            </CardUI>
          ))}
        </div>
        {selectedCards.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-bold mb-2">You are playing:</h3>
            <div className="flex flex-wrap justify-center items-center gap-2">
              {selectedCards.map((card) => (
                <CardUI
                  key={card.id}
                  className="w-16 h-24 sm:w-20 sm:h-28 flex items-center justify-center border-2 border-yellow-500 cursor-pointer"
                  onClick={() => onDeselectCard(card)}
                >
                  <CardContent
                    className={`text-2xl font-bold ${
                      card.suit === "♥" || card.suit === "♦"
                        ? "text-red-500"
                        : "text-black"
                    }`}
                  >
                    {card.value}
                    {card.suit}
                  </CardContent>
                </CardUI>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </CardUI>
  );
};

export default PlayArea;
