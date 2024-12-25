import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Card as CardUI, CardContent } from "@/app/components/ui/card";
import { CardType } from "./contexts/GameContext";

interface CardProps {
  card: CardType;
  onSelectCard: (card: CardType) => void;
  disabled: boolean;
  isSelected: boolean;
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
const Card: React.FC<CardProps> = ({
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

  return (
    <CardUI
      ref={(node) => {
        divRef;
        drag(node);
      }}
      className={`w-16 h-24 sm:w-20 sm:h-28 flex items-center justify-center cursor-pointer ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${disabled ? "cursor-not-allowed" : ""} ${
        isSelected ? "border-4 border-yellow-500" : ""
      }`}
      onClick={() => !disabled && onSelectCard(card)}
    >
      <CardContent
        className={`text-2xl font-bold ${
          card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-black"
        }`}
      >
        {card.value}
        {card.suit}
      </CardContent>
    </CardUI>
  );
};

interface HandProps {
  cards: CardType[];
  onSelectCard: (card: CardType) => void;
  onDeselectCard: (card: CardType) => void;
  selectedCards: CardType[];
  disabled: boolean;
}

const Hand: React.FC<HandProps> = ({
  cards,
  onSelectCard,
  onDeselectCard,
  selectedCards,
  disabled,
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
    <div
      ref={(node) => {
        handRef;
        drop(node);
      }}
      className="mt-4"
    >
      <h2 className="text-lg font-bold mb-2">Your Hand</h2>
      <div className="flex flex-wrap justify-center items-center gap-2">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onSelectCard={onSelectCard}
            disabled={
              disabled ||
              (selectedCards.length === 2 &&
                !selectedCards.some((c) => c.id === card.id))
            }
            isSelected={selectedCards.some((c) => c.id === card.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Hand;
