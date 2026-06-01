"use client";

import { MATCHA_CITY } from "@/lib/constants";
import { useState } from "react";

const VIBE_PROMPTS = {
  "ceremonial & quiet":
    "I want a calm, low-noise cafe in San Francisco with strong ceremonial-grade matcha, minimal crowds, and a cozy atmosphere for a slow afternoon.",
  "best matcha latte":
    "Find San Francisco cafes known for rich, balanced matcha lattes with high-quality powder, good milk texture, and consistently strong reviews.",
  "pastries + matcha":
    "Recommend San Francisco spots with excellent matcha drinks and standout pastries or desserts so I can get both at one stop.",
  "hidden gem":
    "I am looking for lesser-known San Francisco matcha cafes that feel like hidden gems, with great quality and fewer tourists.",
  "study-friendly":
    "Suggest San Francisco matcha cafes that are good for studying, with comfortable seating, reliable wifi, and a quieter vibe.",
} as const;

type Props = {
  onSearch: (query: string) => void;
  loading: boolean;
};

export function MatchaSearchForm({ onSearch, loading }: Props) {
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSearch(query);
  }

  return (
    <section className="relative rounded-[1.5rem] border-[3px] border-double border-ink/20 bg-gradient-to-b from-[#fffefb] to-[#f4efe4] p-6 shadow-[0_14px_38px_rgba(61,52,41,0.18)] sm:p-8">
      <div className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-2 rounded-sm bg-[rgba(255,248,220,0.8)] shadow-sm" />

      <div className="mb-5 border-b-2 border-dashed border-ink/20 pb-4 text-center">
        <p className="font-receipt text-[11px] uppercase tracking-[0.22em] text-ink-soft">
          cashier lane
        </p>
        <div className="mt-1 flex flex-col items-center">
          <p className="inline-flex items-center justify-center gap-2 font-hand text-3xl text-matcha-dark">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 10h16v9H4z" />
              <path d="M7 10V6h10v4" />
              <path d="M8 14h8" />
              <path d="M16.5 14v5" />
            </svg>
            order here
          </p>
          <span className="mt-2 rounded-full border border-matcha/35 bg-matcha-light/55 px-4 py-1 font-receipt text-[10px] uppercase tracking-[0.16em] text-matcha-dark">
            {MATCHA_CITY} only
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="font-receipt text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            prompt
          </span>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your ideal matcha spot: quiet corner, strong ceremonial, cute patio..."
            rows={4}
            className="min-h-28 resize-y rounded-xl border-2 border-ink/20 bg-white px-4 py-3 font-receipt text-[13px] tracking-wide text-ink outline-none placeholder:text-ink-soft/60 focus:border-matcha/50"
          />
        </label>

        <div className="border-b border-dashed border-ink/20 pb-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {Object.entries(VIBE_PROMPTS).map(([vibe, detailedPrompt]) => (
              <button
                key={vibe}
                type="button"
                onClick={() => setQuery(detailedPrompt)}
                className="shrink-0 rounded-full border border-blush/70 bg-blush/35 px-3 py-1.5 font-receipt text-[10px] uppercase tracking-[0.12em] text-ink transition hover:bg-blush/55"
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="font-receipt rounded-xl border border-matcha-dark/40 bg-gradient-to-b from-matcha to-matcha-dark px-5 py-3 text-[13px] uppercase tracking-[0.18em] text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "processing order..." : "print recommendations"}
        </button>
      </form>
    </section>
  );
}
