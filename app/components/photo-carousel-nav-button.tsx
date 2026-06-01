"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Direction = "prev" | "next";

type Props = {
  direction: Direction;
  onClick: () => void;
  /** e.g. "Photo 2 of 5" */
  positionHint?: string;
  disabled?: boolean;
  className?: string;
};

const buttonClass =
  "h-11 w-11 border-ink/25 bg-paper/95 text-ink shadow-[0_2px_12px_rgba(61,52,41,0.35)] hover:border-ink/35 hover:bg-paper focus-visible:outline-matcha sm:h-10 sm:w-10";

export function PhotoCarouselNavButton({
  direction,
  onClick,
  positionHint,
  disabled = false,
  className = "",
}: Props) {
  const verb = direction === "prev" ? "Previous" : "Next";
  const ariaLabel = positionHint
    ? `${verb} photo, ${positionHint}`
    : `${verb} photo`;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`flex shrink-0 items-center justify-center rounded-full border font-receipt transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 ${buttonClass} ${className}`}
    >
      {direction === "prev" ? (
        <ChevronLeft className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
      ) : (
        <ChevronRight className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
      )}
      <span className="sr-only">{verb}</span>
    </button>
  );
}
