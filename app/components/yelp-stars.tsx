"use client";

import { useId } from "react";

type Props = {
  rating?: number;
  reviewCount?: number;
};

function StarIcon({
  filled,
  halfGradientId,
}: {
  filled: "full" | "half" | "empty";
  halfGradientId: string;
}) {
  const fill =
    filled === "full"
      ? "var(--color-matcha)"
      : filled === "half"
        ? `url(#${halfGradientId})`
        : "transparent";

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      {filled === "half" ? (
        <defs>
          <linearGradient id={halfGradientId}>
            <stop offset="50%" stopColor="var(--color-matcha)" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        fill={fill}
        stroke="var(--color-matcha)"
        strokeWidth="1.5"
        d="M12 2l2.9 6.26 6.74.58-5.1 4.42 1.55 6.58L12 16.9l-6.09 3.84 1.55-6.58-5.1-4.42 6.74-.58L12 2z"
      />
    </svg>
  );
}

export function YelpStars({ rating, reviewCount }: Props) {
  const halfGradientId = useId().replace(/:/g, "");
  if (rating == null) {
    return null;
  }

  const stars = Array.from({ length: 5 }, (_, index) => {
    const value = rating - index;
    if (value >= 1) {
      return "full";
    }
    if (value >= 0.5) {
      return "half";
    }
    return "empty";
  }) as Array<"full" | "half" | "empty">;

  return (
    <div
      className="mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5"
      aria-label={`${rating} out of 5 stars on Yelp`}
    >
      <div className="flex items-center gap-0.5">
        {stars.map((filled, index) => (
          <StarIcon
            key={index}
            filled={filled}
            halfGradientId={halfGradientId}
          />
        ))}
        <span className="font-receipt text-xs text-ink">{rating.toFixed(1)}</span>
      </div>
      <span className="font-receipt text-[10px] uppercase tracking-wider text-ink-soft">
        yelp{reviewCount != null ? ` · ${reviewCount.toLocaleString()}` : ""}
      </span>
    </div>
  );
}
