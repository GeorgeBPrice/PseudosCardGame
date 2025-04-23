import React, { useRef, useState, useEffect } from "react";
import { useDrop, XYCoord, DropTargetMonitor } from "react-dnd";
import { Box, Typography, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { CardType, useGameContext } from "./contexts/GameContext";
import DraggableCard from "./DraggableCard";

interface HandProps {
  cards: CardType[];
  onSelectCard: (card: CardType) => void;
  onDeselectCard: (card: CardType) => void;
  selectedCards: CardType[];
  disabled: boolean;
  isPlayerTurn: boolean;
}

type ConnectableElement =
  | React.RefObject<HTMLDivElement>
  | React.RefCallback<HTMLDivElement>
  | null;

const Hand: React.FC<HandProps> = ({
  cards,
  onSelectCard,
  onDeselectCard,
  selectedCards,
  disabled,
  isPlayerTurn,
}) => {
  const { updatePlayerCardPosition, resetPlayerHandLayoutFlags } =
    useGameContext();
  const handRef = useRef<HTMLDivElement>(null);
  const [lastDroppedCardId, setLastDroppedCardId] = useState<number | null>(
    null
  );
  const [containerWidth, setContainerWidth] = useState(0);
  const [calculatedMinHeight, setCalculatedMinHeight] = useState<
    string | number
  >("auto");
  const previousCardsPerRow = useRef<number>(0);

  useEffect(() => {
    const currentHandRef = handRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        window.requestAnimationFrame(() => {
          setContainerWidth(entry.contentRect.width);
        });

        const currentWidth = entry.contentRect.width;
        if (currentWidth > 0) {
          const cardLayoutWidth = 64;
          const minGap = 5;
          const effectiveCardSpacing =
            currentWidth < 700
              ? cardLayoutWidth * 0.8
              : cardLayoutWidth + minGap;
          const horizontalPadding = 10;
          const availableWidth = currentWidth - horizontalPadding * 2;
          const newCardsPerRow = Math.max(
            1,
            Math.floor(availableWidth / effectiveCardSpacing)
          );

          if (
            previousCardsPerRow.current !== 0 &&
            newCardsPerRow !== previousCardsPerRow.current
          ) {
            resetPlayerHandLayoutFlags();
          }
          previousCardsPerRow.current = newCardsPerRow;
        }
      }
    });

    if (currentHandRef) {
      resizeObserver.observe(currentHandRef);
      setContainerWidth(currentHandRef.clientWidth);
    }

    return () => {
      if (currentHandRef) {
        resizeObserver.unobserve(currentHandRef);
      }
    };
  }, [resetPlayerHandLayoutFlags]);

  useEffect(() => {
    if (containerWidth <= 0 || cards.length === 0) return;

    const cardLayoutWidth = 64;
    const cardLayoutHeight = 96;
    const minGap = 5;

    const effectiveCardSpacing =
      containerWidth < 700 ? cardLayoutWidth * 0.8 : cardLayoutWidth + minGap;

    const horizontalPadding = 10;
    const availableWidth = containerWidth - horizontalPadding * 2;
    const cardsPerRow = Math.max(
      1,
      Math.floor(availableWidth / effectiveCardSpacing)
    );

    const verticalPadding = 10;
    const rowGap = 15;

    const numRows = Math.max(1, Math.ceil(cards.length / cardsPerRow));
    const dynamicHeight =
      numRows * (cardLayoutHeight * 0.75 + rowGap) -
      rowGap +
      verticalPadding * 2;

    const mobileBreakpoint = 700;
    if (containerWidth < mobileBreakpoint) {
      setCalculatedMinHeight(`${dynamicHeight}px`);
    } else {
      setCalculatedMinHeight(
        { xs: "8.5rem", sm: "10.5rem", md: "14rem" }["md"]
      );
    }

    const updates: { cardId: number; position: { x: number; y: number } }[] =
      [];

    cards.forEach((card, index) => {
      if (!card.hasBeenDragged) {
        const row = Math.floor(index / cardsPerRow);
        const col = index % cardsPerRow;

        const x = horizontalPadding + col * effectiveCardSpacing;
        const y = verticalPadding + row * (cardLayoutHeight * 0.75 + rowGap);

        if (card.position?.x !== x || card.position?.y !== y) {
          updates.push({ cardId: card.id, position: { x, y } });
        }
      }
    });

    if (updates.length > 0) {
      updates.forEach((update) => {
        updatePlayerCardPosition(update.cardId, update.position, {
          markAsDragged: false,
        });
      });
    }
  }, [
    cards,
    containerWidth,
    updatePlayerCardPosition,
    resetPlayerHandLayoutFlags,
  ]);

  const [, drop] = useDrop(() => ({
    accept: "card",
    drop: (item: CardType, monitor: DropTargetMonitor<CardType, unknown>) => {
      const handRect = handRef.current?.getBoundingClientRect();
      const sourceClientOffset = monitor.getSourceClientOffset();

      if (handRect && sourceClientOffset) {
        let x = sourceClientOffset.x - handRect.left;
        let y = sourceClientOffset.y - handRect.top;

        const cardWidth = 64;
        const cardHeight = 96;
        x = Math.max(0, Math.min(x, handRect.width - cardWidth));
        y = Math.max(0, Math.min(y, handRect.height - cardHeight));

        let finalX = x;
        let finalY = y;

        const otherCards = cards.filter((c) => c.id !== item.id);
        let snapped = false;
        for (const targetCard of otherCards) {
          if (targetCard.position) {
            const targetLeft = targetCard.position.x;
            const targetRight = targetCard.position.x + cardWidth;
            const targetTop = targetCard.position.y;
            const targetBottom = targetCard.position.y + cardHeight;

            const dropCenterX = x + cardWidth / 2;
            const dropCenterY = y + cardHeight / 2;

            if (
              dropCenterX > targetLeft &&
              dropCenterX < targetRight &&
              dropCenterY > targetTop &&
              dropCenterY < targetBottom
            ) {
              finalX = targetCard.position.x + cardWidth * 0.7;
              finalY = targetCard.position.y;
              snapped = true;
              break;
            }
          }
        }

        if (snapped) {
          finalX = Math.max(0, Math.min(finalX, handRect.width - cardWidth));
          finalY = Math.max(0, Math.min(finalY, handRect.height - cardHeight));
        }

        updatePlayerCardPosition(
          item.id,
          { x: finalX, y: finalY },
          { markAsDragged: true }
        );
        setLastDroppedCardId(item.id);
      }

      const isSelected = selectedCards.some((c) => c.id === item.id);
      if (isSelected) {
        onDeselectCard(item);
      }
    },
  }));

  const combinedRef = (element: HTMLDivElement | null) => {
    (handRef as React.MutableRefObject<HTMLDivElement | null>).current =
      element;
    (drop as (instance: HTMLDivElement | null) => void)(element);
  };

  return (
    <Box
      sx={{
        marginBottom: "1rem",
        display: "flex",
        gap: "1rem",
        padding: "1rem",
        border: "2px solid",
        borderColor: isPlayerTurn ? "#90EE90" : "rgba(0, 0, 0, 0.12)",
        borderRadius: "1rem",
        transition: "all 0.3s",
        animation: isPlayerTurn ? "shake 0.5s" : "none",
        "@keyframes shake": {
          "0%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-1px)" },
          "50%": { transform: "translateX(1px)" },
          "75%": { transform: "translateX(-1px)" },
          "100%": { transform: "translateX(0)" },
        },
        position: "relative",
      }}
    >
      <IconButton
        onClick={resetPlayerHandLayoutFlags}
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 150,
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          },
        }}
        title="Reset Card Positions"
      >
        <RefreshIcon fontSize="small" />
      </IconButton>

      <Box
        sx={{
          width: "5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(144, 238, 144, 0.2)",
          borderRadius: "0.5rem",
          border: "1px solid",
          borderColor: isPlayerTurn ? "#90EE90" : "rgba(0, 0, 0, 0.12)",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            textAlign: "center",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            color: isPlayerTurn ? "#2E7D32" : "inherit",
          }}
        >
          Your Hand
        </Typography>
      </Box>

      <Box
        ref={combinedRef}
        sx={{
          flex: 1,
          maxWidth: "100%",
          minHeight: calculatedMinHeight,
          position: "relative",
          border: "1px dashed lightgrey",
          overflow: "hidden",
        }}
      >
        {cards.map((card) => {
          const left = card.position?.x ?? 10;
          const top = card.position?.y ?? 10;

          return (
            <Box
              key={card.id}
              sx={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                transition: card.hasBeenDragged
                  ? "none"
                  : "left 0.2s ease-out, top 0.2s ease-out",
                zIndex:
                  card.id === lastDroppedCardId
                    ? 100
                    : selectedCards.includes(card)
                    ? 10
                    : 1,
              }}
            >
              <DraggableCard
                card={card}
                onSelectCard={onSelectCard}
                disabled={disabled}
                isSelected={selectedCards.includes(card)}
                isPlayerTurn={isPlayerTurn}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Hand;
