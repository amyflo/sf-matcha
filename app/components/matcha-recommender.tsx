"use client";

import { ReceiptDesk } from "@/app/components/receipt-desk";
import { useReceiptSound } from "@/app/components/receipt-sound-provider";
import { MatchaSearchForm } from "@/app/components/matcha-search-form";
import { SoundToggle } from "@/app/components/sound-toggle";
import type { MatchaRecommendation } from "@/lib/types";
import { Printer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function MatchaRecommenderInner() {
  const { unlockEffects, playOrderProcessing } = useReceiptSound();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MatchaRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOrderPanel, setShowOrderPanel] = useState(true);
  const [reprintRequestId, setReprintRequestId] = useState(0);
  const previousLoadingRef = useRef(false);
  const hasReceipts = (data?.cafes?.length ?? 0) > 0;
  const centerOrderPanel = !hasReceipts;

  useEffect(() => {
    const finishedLoadingWithResults =
      previousLoadingRef.current && !loading && !error && hasReceipts;
    previousLoadingRef.current = loading;

    if (finishedLoadingWithResults) {
      setShowOrderPanel(false);
    }
  }, [loading, error, hasReceipts]);

  async function handleSearch(query: string) {
    await unlockEffects();
    setLoading(true);
    playOrderProcessing();
    setError(null);
    setShowOrderPanel(true);

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

  async function handleReprint() {
    await unlockEffects();
    setReprintRequestId((id) => id + 1);
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col">
      {hasReceipts && !loading ? (
        <button
          type="button"
          onClick={() => void handleReprint()}
          aria-label="Reprint receipts"
          className="absolute right-3 top-3 z-20 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ink/20 bg-white/90 px-4 py-2.5 font-receipt text-[10px] uppercase tracking-[0.16em] text-ink shadow-[0_4px_12px_rgba(61,52,41,0.12)] transition hover:bg-white sm:min-h-0 sm:py-2"
        >
          <Printer aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
          reprint
        </button>
      ) : null}

      <div className="absolute right-3 z-20 max-sm:bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:right-4">
        <SoundToggle />
      </div>

      <div className="relative z-0 h-full min-h-0 flex-1">
        <ReceiptDesk
          cafes={data?.cafes ?? null}
          error={error}
          loading={loading}
          reprintRequestId={reprintRequestId}
        />
      </div>

      {hasReceipts && !centerOrderPanel ? (
        <button
          type="button"
          aria-label="Close order panel"
          onClick={() => setShowOrderPanel(false)}
          className={`fixed inset-0 z-40 bg-ink/45 transition-opacity duration-300 max-sm:block sm:hidden ${
            showOrderPanel
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        />
      ) : null}

      <aside
        className={
          centerOrderPanel
            ? "pointer-events-none absolute left-1/2 top-1/2 z-40 w-[min(42rem,calc(100%-1rem))] -translate-x-1/2 -translate-y-1/2 px-2 sm:w-[min(42rem,calc(100%-1.5rem))] sm:px-0"
            : `pointer-events-none absolute z-40 w-[min(24rem,calc(100%-1rem))] transition-[transform,opacity] duration-300 sm:left-3 sm:top-3 sm:h-[calc(100%-1.5rem)] sm:w-[24rem] max-sm:fixed max-sm:inset-0 max-sm:flex max-sm:w-full max-sm:items-center max-sm:justify-center max-sm:px-3 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:pt-[max(0.75rem,env(safe-area-inset-top))] ${
                showOrderPanel
                  ? "sm:translate-x-0 max-sm:opacity-100"
                  : "sm:-translate-x-[110%] max-sm:opacity-0"
              }`
        }
      >
        <div className="pointer-events-auto relative w-full overflow-auto rounded-[2rem] bg-transparent p-1 max-sm:max-h-[min(85dvh,36rem)] max-sm:overscroll-contain sm:h-full sm:max-h-[inherit]">
          {hasReceipts && !loading ? (
            <button
              type="button"
              onClick={() => setShowOrderPanel(false)}
              aria-label="Hide order panel"
              className="absolute right-3 top-3 z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-ink/20 bg-white/90 text-ink shadow-[0_4px_12px_rgba(61,52,41,0.12)] transition hover:bg-white sm:right-4 sm:top-4 sm:min-h-0 sm:min-w-0 sm:p-2"
            >
              <X aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}
          <MatchaSearchForm onSearch={handleSearch} loading={loading} />
        </div>
      </aside>

      {hasReceipts && !showOrderPanel ? (
        <button
          type="button"
          onClick={() => setShowOrderPanel(true)}
          className="absolute left-3 z-40 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-matcha/30 bg-white/90 px-4 py-2.5 font-receipt text-[10px] uppercase tracking-[0.2em] text-matcha-dark shadow-[0_6px_16px_rgba(61,52,41,0.15)] transition hover:bg-white max-sm:bottom-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:top-auto sm:top-3 sm:min-h-0 sm:py-2"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 10h16v9H4z" />
            <path d="M7 10V6h10v4" />
            <path d="M8 14h8" />
          </svg>
          order here
        </button>
      ) : null}
    </div>
  );
}

export function MatchaRecommender() {
  return <MatchaRecommenderInner />;
}
