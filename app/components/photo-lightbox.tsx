"use client";

import { PhotoCarouselNavButton } from "@/app/components/photo-carousel-nav-button";
import { useReceiptSound } from "@/app/components/receipt-sound-provider";
import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type Props = {
  openUrl: string | null;
  openIndex: number;
  images: string[];
  labels: string[];
  cafeName: string;
  onClose: () => void;
  onNavigate: (url: string) => void;
};

export function PhotoLightbox({
  openUrl,
  openIndex,
  images,
  labels,
  cafeName,
  onClose,
  onNavigate,
}: Props) {
  const { setPreviewOpen } = useReceiptSound();
  const mounted = useIsClient();

  useEffect(() => {
    setPreviewOpen(!!openUrl);
    return () => setPreviewOpen(false);
  }, [openUrl, setPreviewOpen]);

  useEffect(() => {
    if (!openUrl || openIndex < 0) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" && openIndex > 0) {
        onNavigate(images[openIndex - 1]);
      }
      if (event.key === "ArrowRight" && openIndex < images.length - 1) {
        onNavigate(images[openIndex + 1]);
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openUrl, openIndex, images, onClose, onNavigate]);

  if (!openUrl || !mounted || openIndex < 0) {
    return null;
  }

  const label =
    `${labels[openIndex] ?? "review photo"} at ${cafeName}`;
  const positionHint = `${openIndex + 1} of ${images.length}`;
  const canGoPrev = openIndex > 0;
  const canGoNext = openIndex < images.length - 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex min-h-dvh flex-col bg-ink/88"
      role="dialog"
      aria-modal="true"
      aria-label="Review photo preview"
      onClick={onClose}
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-6">
        <p className="font-hand text-2xl text-paper sm:text-3xl">{cafeName}</p>
        <button
          type="button"
          className="min-h-11 rounded-full border border-paper/35 bg-paper/15 px-4 py-2.5 font-receipt text-[10px] uppercase tracking-widest text-paper backdrop-blur-sm hover:bg-paper/25 sm:min-h-0 sm:py-2"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          close
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 pb-6 sm:px-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative w-full max-w-6xl px-10 sm:px-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={openUrl}
            alt={label}
            className="mx-auto max-h-[calc(100dvh-11rem)] w-full object-contain"
            referrerPolicy="no-referrer"
          />
          <PhotoCarouselNavButton
            direction="prev"
            positionHint={positionHint}
            disabled={!canGoPrev}
            onClick={() => onNavigate(images[openIndex - 1])}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 sm:left-2"
          />
          <PhotoCarouselNavButton
            direction="next"
            positionHint={positionHint}
            disabled={!canGoNext}
            onClick={() => onNavigate(images[openIndex + 1])}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 sm:right-2"
          />
        </div>

        {labels[openIndex] ? (
          <p className="mt-4 max-w-2xl px-4 text-center font-hand text-2xl text-paper">
            {labels[openIndex]}
          </p>
        ) : null}

        <p className="mt-4 font-receipt text-[10px] uppercase tracking-widest text-paper/75">
          {positionHint}
        </p>
      </div>
    </div>,
    document.body,
  );
}
