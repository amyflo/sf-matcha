"use client";

import { MatchaReceiptCard } from "@/app/components/matcha-receipt-card";
import type { MatchaCafe } from "@/lib/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CardPosition = {
  x: number;
  y: number;
  rotate: number;
  z: number;
};

type Props = {
  cafes: MatchaCafe[] | null;
  error: string | null;
  loading: boolean;
};

const DEFAULT_CARD_HEIGHT = 720;

function deskCardWidth(deskWidth: number) {
  return Math.min(340, Math.max(250, Math.floor(deskWidth * 0.28)));
}

function buildLayout(
  count: number,
  deskWidth: number,
  deskHeight: number,
  cardWidth: number,
  cardHeight: number,
): CardPosition[] {
  const centerX = Math.max(20, (deskWidth - cardWidth) / 2);
  const centerY = Math.max(32, (deskHeight - cardHeight) / 2);

  if (count <= 1) {
    return [{ x: centerX, y: centerY, rotate: -2, z: 1 }];
  }

  return Array.from({ length: count }, (_, index) => ({
    x: centerX + index * 36 - ((count - 1) * 36) / 2,
    y: centerY + index * 16 - ((count - 1) * 16) / 2,
    rotate: -5 + index * 2.5,
    z: index + 1,
  }));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !!target.closest(
      "button, a, input, textarea, select, label, [role='button'], [data-no-drag]",
    )
  );
}

export function ReceiptDesk({ cafes, error, loading }: Props) {
  const deskRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<{
    index: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [positions, setPositions] = useState<CardPosition[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [topZ, setTopZ] = useState(10);
  const [cardWidth, setCardWidth] = useState(420);
  const [cardHeights, setCardHeights] = useState<number[]>([]);

  const deck = useMemo(() => (cafes && cafes.length > 0 ? cafes : []), [cafes]);

  const resetLayout = useCallback(() => {
    const desk = deskRef.current;
    if (!desk || deck.length === 0) {
      setPositions([]);
      return;
    }

    const width = desk.clientWidth;
    const height = desk.clientHeight;
    const nextCardWidth = deskCardWidth(width);
    setCardWidth(nextCardWidth);
    setPositions(
      buildLayout(
        deck.length,
        width,
        height,
        nextCardWidth,
        DEFAULT_CARD_HEIGHT,
      ),
    );
    setTopZ(deck.length + 10);
  }, [deck.length]);

  useEffect(() => {
    cardRefs.current = [];
    setCardHeights([]);
    resetLayout();
  }, [cafes, error, resetLayout]);

  useEffect(() => {
    const desk = deskRef.current;
    if (!desk) {
      return;
    }

    const observer = new ResizeObserver(() => {
      setCardWidth(deskCardWidth(desk.clientWidth));
      if (positions.length === 0) {
        resetLayout();
      }
    });

    observer.observe(desk);
    return () => observer.disconnect();
  }, [positions.length, resetLayout]);

  useEffect(() => {
    if (draggingIndex === null) {
      return;
    }

    function onPointerMove(event: PointerEvent) {
      const drag = dragRef.current;
      const desk = deskRef.current;
      if (!drag || !desk) {
        return;
      }

      const rect = desk.getBoundingClientRect();
      const nextX = event.clientX - rect.left - drag.offsetX;
      const nextY = event.clientY - rect.top - drag.offsetY;

      setPositions((prev) =>
        prev.map((pos, index) =>
          index === drag.index
            ? {
                ...pos,
                x: clamp(nextX, -32, rect.width - cardWidth + 32),
                y: clamp(
                  nextY,
                  -48,
                  rect.height -
                    (cardHeights[drag.index] ?? DEFAULT_CARD_HEIGHT) +
                    64,
                ),
              }
            : pos,
        ),
      );
    }

    function onPointerUp() {
      dragRef.current = null;
      setDraggingIndex(null);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [draggingIndex, cardWidth, cardHeights]);

  useEffect(() => {
    const nodes = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (nodes.length === 0) {
      return;
    }

    function measure() {
      const nextHeights = nodes.map((node) => node.offsetHeight);
      setCardHeights((prev) => {
        if (
          prev.length === nextHeights.length &&
          prev.every((height, index) => height === nextHeights[index])
        ) {
          return prev;
        }
        return nextHeights;
      });
    }

    measure();

    const observer = new ResizeObserver(measure);
    for (const node of nodes) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [deck.length, cardWidth, loading, error]);

  function bringToFront(index: number) {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setPositions((prev) =>
      prev.map((pos, i) => (i === index ? { ...pos, z: nextZ } : pos)),
    );
  }

  function handlePointerDown(index: number, event: React.PointerEvent) {
    if (isInteractiveTarget(event.target)) {
      bringToFront(index);
      return;
    }

    const desk = deskRef.current;
    if (!desk) {
      return;
    }

    event.preventDefault();
    bringToFront(index);

    const rect = desk.getBoundingClientRect();
    const pos = positions[index];
    dragRef.current = {
      index,
      offsetX: event.clientX - rect.left - pos.x,
      offsetY: event.clientY - rect.top - pos.y,
    };
    setDraggingIndex(index);
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col">
      <div
        ref={deskRef}
        className="relative h-full min-h-0 flex-1 overflow-auto bg-[#b8b0a0] shadow-[inset_0_2px_16px_rgba(61,52,41,0.28)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(61,52,41,0.06) 28px, rgba(61,52,41,0.06) 29px)",
          }}
        />

        {error ? (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-lg text-red-900">
            oops — {error}
          </p>
        ) : null}

        {loading ? (
          <p className="absolute inset-0 flex items-center justify-center font-hand text-3xl text-ink animate-pulse">
            brewing...
          </p>
        ) : null}

        <div
          className="relative min-h-full p-6 sm:p-8"
          style={{
            minHeight:
              positions.length > 0 && cardHeights.length > 0
                ? Math.max(
                    DEFAULT_CARD_HEIGHT + 120,
                    ...cardHeights.map((h, i) => {
                      const pos = positions[i];
                      return pos ? pos.y + h + 80 : 0;
                    }),
                  )
                : undefined,
          }}
        >
          {!loading && !error
            ? deck.map((cafe, index) => {
                const pos = positions[index];
                if (!pos) {
                  return null;
                }

                return (
                  <div
                    key={`${cafe.name}-${cafe.address}`}
                    ref={(node) => {
                      cardRefs.current[index] = node;
                    }}
                    className={`absolute select-none ${
                      draggingIndex === index
                        ? "cursor-grabbing"
                        : "cursor-grab"
                    }`}
                    style={{
                      width: cardWidth,
                      left: 0,
                      top: 0,
                      zIndex: pos.z,
                      transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotate}deg)`,
                      transition:
                        draggingIndex === index
                          ? "none"
                          : "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                    onPointerDown={(event) => handlePointerDown(index, event)}
                  >
                    <MatchaReceiptCard cafe={cafe} onDesk />
                  </div>
                );
              })
            : null}
        </div>
      </div>
    </section>
  );
}
