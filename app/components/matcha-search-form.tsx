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
  const [validationError, setValidationError] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const canSubmit = trimmedQuery.length > 0 && !loading;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!trimmedQuery) {
      setValidationError("add a prompt before printing recommendations");
      return;
    }

    setValidationError(null);
    onSearch(trimmedQuery);
  }

  function handleClear() {
    setQuery("");
    setValidationError(null);
  }

  return (
    <section className="relative rounded-[1.25rem] border-[3px] border-double border-ink/20 bg-gradient-to-b from-[#fffefb] to-[#f4efe4] p-4 shadow-[0_14px_38px_rgba(61,52,41,0.18)] sm:rounded-[1.5rem] sm:p-6 md:p-8">
      {loading ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 flex items-center justify-center rounded-[1.5rem] bg-[#fffefb]/85 backdrop-blur-[1px]"
        >
          <p className="px-4 text-center font-hand text-2xl text-matcha-dark animate-pulse sm:text-3xl">
            processing order...
          </p>
        </div>
      ) : null}

      <div className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-2 rounded-sm bg-[rgba(255,248,220,0.8)] shadow-sm" />

      <div className="mb-5 border-b-2 border-dashed border-ink/20 pb-4 text-center">
 
        <div className="mt-1 flex flex-col items-center">
          <p className="inline-flex items-center justify-center gap-2 font-hand text-2xl text-matcha-dark sm:text-3xl">
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

      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-receipt text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              prompt
            </span>
            <button
              type="button"
              disabled={loading || query.length === 0}
              onClick={handleClear}
              aria-label="Reset prompt"
              className="shrink-0 rounded-full border border-ink/20 bg-white/90 px-3 py-2 font-receipt text-[10px] uppercase tracking-[0.16em] text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:px-2.5 sm:py-1"
            >
              reset
            </button>
          </div>
          <textarea
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (validationError) {
                setValidationError(null);
              }
            }}
            placeholder="Describe your ideal matcha spot: quiet corner, strong ceremonial, cute patio..."
            rows={4}
            disabled={loading}
            aria-invalid={validationError ? true : undefined}
            aria-describedby={validationError ? "prompt-error" : undefined}
            className="min-h-28 resize-y rounded-xl border-2 border-ink/20 bg-white px-4 py-3 font-receipt text-[13px] tracking-wide text-ink outline-none placeholder:text-ink-soft/60 focus:border-matcha/50 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-400/70"
          />
          {validationError ? (
            <p
              id="prompt-error"
              role="alert"
              className="font-receipt text-[11px] uppercase tracking-[0.12em] text-red-900"
            >
              {validationError}
            </p>
          ) : null}
        </label>

        <div className="border-b border-dashed border-ink/20 pb-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch]">
            {Object.entries(VIBE_PROMPTS).map(([vibe, detailedPrompt]) => (
              <button
                key={vibe}
                type="button"
                disabled={loading}
                onClick={() => {
                  setQuery(detailedPrompt);
                  setValidationError(null);
                }}
                className="shrink-0 rounded-full border border-blush/70 bg-blush/35 px-3 py-2.5 font-receipt text-[10px] uppercase tracking-[0.12em] text-ink transition hover:bg-blush/55 disabled:cursor-not-allowed disabled:opacity-50 sm:py-1.5"
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="font-receipt min-h-11 rounded-xl border border-matcha-dark/40 bg-gradient-to-b from-matcha to-matcha-dark px-5 py-3 text-[13px] uppercase tracking-[0.18em] text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "processing order..." : "print recommendations"}
        </button>
      </form>
    </section>
  );
}
