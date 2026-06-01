"use client";

import { ReceiptDesk } from "@/app/components/receipt-desk";
import { MatchaSearchForm } from "@/app/components/matcha-search-form";
import type { MatchaRecommendation } from "@/lib/types";
import { useState } from "react";

export function MatchaRecommender() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MatchaRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOrderPanel, setShowOrderPanel] = useState(true);
  const hasReceipts = (data?.cafes?.length ?? 0) > 0;
  const centerOrderPanel = !hasReceipts;

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const payload = (await response.json()) as
        | MatchaRecommendation
        | { error: string };

      if (!response.ok) {
        const message =
          "error" in payload ? payload.error : "Search failed";
        throw new Error(message);
      }

      setData(payload as MatchaRecommendation);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="h-full min-h-0 flex-1">
        <ReceiptDesk
          cafes={data?.cafes ?? null}
          error={error}
          loading={loading}
        />
      </div>

      <aside
        className={
          centerOrderPanel
            ? "pointer-events-none absolute left-1/2 top-1/2 z-30 w-[min(42rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2"
            : `pointer-events-none absolute left-2 top-2 z-30 h-[calc(100%-1rem)] w-[min(24rem,calc(100%-1rem))] transition-transform duration-300 sm:left-3 sm:top-3 sm:h-[calc(100%-1.5rem)] sm:w-[24rem] ${
                showOrderPanel ? "translate-x-0" : "-translate-x-[110%]"
              }`
        }
      >
        <div className="pointer-events-auto relative h-full overflow-auto rounded-[2rem] bg-transparent p-1">
          {hasReceipts ? (
            <button
              type="button"
              onClick={() => setShowOrderPanel(false)}
              className="absolute right-4 top-4 z-20 rounded-full border border-ink/20 bg-white/90 px-2.5 py-1 font-receipt text-[10px] uppercase tracking-[0.16em] text-ink transition hover:bg-white"
            >
              hide
            </button>
          ) : null}
          <MatchaSearchForm onSearch={handleSearch} loading={loading} />
        </div>
      </aside>

      {hasReceipts && !showOrderPanel ? (
        <button
          type="button"
          onClick={() => setShowOrderPanel(true)}
          className="absolute left-3 top-3 z-20 rounded-full border border-matcha/30 bg-white/90 px-4 py-2 font-receipt text-[10px] uppercase tracking-[0.2em] text-matcha-dark shadow-[0_6px_16px_rgba(61,52,41,0.15)] transition hover:bg-white"
        >
          order here
        </button>
      ) : null}
    </div>
  );
}
