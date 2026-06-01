"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!openUrl) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [openUrl]);

  if (!openUrl || !mounted) {
    return null;
  }

  const label =
    openIndex >= 0
      ? `${labels[openIndex] ?? "review photo"} at ${cafeName}`
      : `Review photo at ${cafeName}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex min-h-dvh flex-col bg-ink/85"
      role="dialog"
      aria-modal="true"
      aria-label="Review photo preview"
      onClick={onClose}
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-6">
        <p className="font-hand text-2xl text-white sm:text-3xl">{cafeName}</p>
        <button
          type="button"
          className="rounded-full border border-white/30 bg-white/10 px-4 py-2 font-receipt text-[10px] uppercase tracking-widest text-white backdrop-blur-sm hover:bg-white/20"
          onClick={onClose}
        >
          close
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6 sm:px-8"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={openUrl}
          alt={label}
          className="max-h-[calc(100dvh-10rem)] w-full max-w-6xl object-contain"
          referrerPolicy="no-referrer"
        />

        {labels[openIndex] ? (
          <p className="mt-4 text-center font-hand text-2xl text-white">
            {labels[openIndex]}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {openIndex > 0 ? (
            <button
              type="button"
              className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 font-receipt text-[10px] uppercase tracking-widest text-white backdrop-blur-sm hover:bg-white/20"
              onClick={() => onNavigate(images[openIndex - 1])}
            >
              prev
            </button>
          ) : null}
          {openIndex < images.length - 1 ? (
            <button
              type="button"
              className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 font-receipt text-[10px] uppercase tracking-widest text-white backdrop-blur-sm hover:bg-white/20"
              onClick={() => onNavigate(images[openIndex + 1])}
            >
              next
            </button>
          ) : null}
        </div>

        <p className="mt-4 font-receipt text-[10px] uppercase tracking-widest text-white/70">
          {openIndex + 1} / {images.length}
        </p>
      </div>
    </div>,
    document.body,
  );
}
