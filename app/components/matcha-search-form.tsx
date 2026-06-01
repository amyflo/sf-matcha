"use client";

import { MATCHA_CITY } from "@/lib/constants";
import { useState } from "react";

const VIBE_OPTIONS = [
  "ceremonial & quiet",
  "best matcha latte",
  "pastries + matcha",
  "hidden gem",
  "study-friendly",
] as const;

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
    <section className="relative rounded-[2rem] border-2 border-dashed border-matcha/35 bg-white/70 p-6 shadow-[0_8px_30px_rgba(61,52,41,0.06)] sm:p-8">
      <div className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-2 rounded-sm bg-[rgba(255,248,220,0.72)] shadow-sm" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-hand text-3xl text-matcha-dark">order here</p>
        <span className="rounded-full border border-matcha/30 bg-matcha-light/60 px-4 py-1.5 text-sm text-matcha-dark">
          {MATCHA_CITY} only
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-lg text-ink-soft">what kind of matcha day?</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="quiet corner, strong ceremonial, cute patio..."
            className="rounded-2xl border-2 border-matcha/20 bg-paper px-4 py-3 text-lg text-ink outline-none placeholder:text-ink-soft/60 focus:border-matcha/50"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {VIBE_OPTIONS.map((vibe) => (
            <button
              key={vibe}
              type="button"
              onClick={() => setQuery(vibe)}
              className="rounded-full border border-blush bg-blush/40 px-3 py-1.5 text-sm text-ink transition hover:bg-blush/70"
            >
              {vibe}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="font-hand rounded-2xl bg-matcha px-5 py-3 text-2xl text-white transition hover:bg-matcha-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "flipping through the menu..." : "curate my menu"}
        </button>
      </form>
    </section>
  );
}
