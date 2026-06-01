"use client";

import { MatchaReceiptCard } from "@/app/components/matcha-receipt-card";
import { useReceiptSound } from "@/app/components/receipt-sound-provider";
import {
  getReceiptPrintPhaseMs,
  PRINT_STAGGER_MS,
} from "@/lib/receipt-print-timing";
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
  reprintRequestId?: number;
};

const DEFAULT_CARD_HEIGHT = 720;

function deskCardWidth(deskWidth: number) {
  const deskPadding = deskWidth < 640 ? 32 : 48;
  const maxFit = deskWidth - deskPadding;
  return Math.min(340, Math.max(220, maxFit));
}

function buildLayout(
  count: number,
  deskWidth: number,
  deskHeight: number,
  cardWidth: number,
  cardHeight: number,
): CardPosition[] {
  const narrow = deskWidth < 640;
  const spreadX = narrow ? 18 : 36;
  const spreadY = narrow ? 10 : 16;
  const centerX = Math.max(12, (deskWidth - cardWidth) / 2);
  const centerY = Math.max(narrow ? 16 : 32, (deskHeight - cardHeight) / 2);

  if (count <= 1) {
    return [{ x: centerX, y: centerY, rotate: -2, z: 1 }];
  }

  return Array.from({ length: count }, (_, index) => ({
    x: centerX + index * spreadX - ((count - 1) * spreadX) / 2,
    y: centerY + index * spreadY - ((count - 1) * spreadY) / 2,
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

export function ReceiptDesk({
  cafes,
  error,
  loading,
  reprintRequestId = 0,
}: Props) {
  const { playReceiptPrint, playReceiptHandle, playPaperDown } = useReceiptSound();
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
  const [isPrinting, setIsPrinting] = useState(false);
  const [printBatchId, setPrintBatchId] = useState(0);
  const previousLoadingRef = useRef(loading);
  const previousReprintRef = useRef(reprintRequestId ?? 0);
  const printTimeoutRef = useRef<number | null>(null);

  const deck = useMemo(() => (cafes && cafes.length > 0 ? cafes : []), [cafes]);

  const triggerPrint = useCallback(() => {
    if (deck.length === 0) {
      return;
    }

    if (printTimeoutRef.current !== null) {
      window.clearTimeout(printTimeoutRef.current);
    }

    setIsPrinting(true);
    setPrintBatchId((prev) => prev + 1);
    playReceiptPrint(deck.length);

    printTimeoutRef.current = window.setTimeout(() => {
      setIsPrinting(false);
      printTimeoutRef.current = null;
    }, getReceiptPrintPhaseMs(deck.length));
  }, [deck.length, playReceiptPrint]);

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
      if (dragRef.current) {
        void playPaperDown();
      }
      dragRef.current = null;
      setDraggingIndex(null);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [draggingIndex, cardWidth, cardHeights, playPaperDown]);

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

  useEffect(() => {
    const finishedLoadingWithResults =
      previousLoadingRef.current && !loading && !error && deck.length > 0;
    previousLoadingRef.current = loading;

    if (!finishedLoadingWithResults) {
      return;
    }

    triggerPrint();
  }, [loading, error, deck.length, triggerPrint]);

  useEffect(() => {
    if (
      reprintRequestId === 0 ||
      reprintRequestId === previousReprintRef.current ||
      loading ||
      error ||
      deck.length === 0
    ) {
      return;
    }

    previousReprintRef.current = reprintRequestId;
    triggerPrint();
  }, [reprintRequestId, loading, error, deck.length, triggerPrint]);

  useEffect(() => {
    return () => {
      if (printTimeoutRef.current !== null) {
        window.clearTimeout(printTimeoutRef.current);
      }
    };
  }, []);

  function bringToFront(index: number) {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setPositions((prev) =>
      prev.map((pos, i) => (i === index ? { ...pos, z: nextZ } : pos)),
    );
  }

  function handlePointerDown(index: number, event: React.PointerEvent) {
    if (isPrinting) {
      return;
    }

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
    playReceiptHandle();
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col">
      <div
        ref={deskRef}
        className="desk-workspace relative h-full min-h-0 flex-1 overflow-auto"
      >

        {error ? (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-base text-red-900 sm:px-6 sm:text-lg">
            oops — {error}
          </p>
        ) : null}

        {loading ? (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center font-hand text-2xl text-ink animate-pulse sm:text-3xl">
            brewing...
          </p>
        ) : null}

        {isPrinting ? (
          <div className="pointer-events-none absolute inset-0 z-15 animate-receipt-print-sweep bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.32)_50%,rgba(255,255,255,0)_100%)] bg-[length:100%_160px] bg-no-repeat" />
        ) : null}

        <div
          className="relative min-h-full p-4 sm:p-6 md:p-8"
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
                      isPrinting
                        ? "cursor-default"
                        : draggingIndex === index
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
                    <div
                      key={`${printBatchId}-${index}`}
                      className={isPrinting ? "animate-receipt-print-card" : ""}
                      style={
                        isPrinting
                          ? {
                              animationDelay: `${index * PRINT_STAGGER_MS}ms`,
                              animationFillMode: "both",
                            }
                          : undefined
                      }
                    >
                      <MatchaReceiptCard cafe={cafe} onDesk />
                    </div>
                  </div>
                );
              })
            : null}
        </div>
      </div>
    </section>
  );
}
