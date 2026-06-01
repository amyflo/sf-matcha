"use client";

import { PhotoLightbox } from "@/app/components/photo-lightbox";
import { useEffect, useState } from "react";

type Props = {
  images: string[];
  labels: string[];
  cafeName: string;
  activeIndex: number;
  onIndexChangeAction: (index: number) => void;
  onDesk?: boolean;
  size?: "default" | "hero";
};

export function ReviewPhotoCarousel({
  images,
  labels,
  cafeName,
  activeIndex,
  onIndexChangeAction,
  onDesk = false,
  size = "default",
}: Props) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const openIndex = openUrl ? images.indexOf(openUrl) : -1;

  const index = images.length === 0 ? 0 : activeIndex % images.length;

  useEffect(() => {
    if (!openUrl) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenUrl(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openUrl]);

  if (images.length === 0) {
    return null;
  }

  const imageHeightClass =
    size === "hero" ? (onDesk ? "h-56" : "h-48") : onDesk ? "h-44" : "h-40";

  const current = images[index];
  const currentLabel = labels[index];

  function go(delta: number) {
    onIndexChangeAction((index + delta + images.length) % images.length);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    event.currentTarget.dataset.touchX = String(touch.clientX);
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const startX = Number(event.currentTarget.dataset.touchX);
    const endX = event.changedTouches[0]?.clientX;
    if (Number.isNaN(startX) || endX == null) {
      return;
    }

    const delta = endX - startX;
    if (Math.abs(delta) < 40) {
      return;
    }

    go(delta > 0 ? -1 : 1);
  }

  return (
    <>
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={() => setOpenUrl(current)}
          className="relative block w-full cursor-zoom-in text-left transition duration-150 hover:scale-[1.01] hover:shadow-[0_8px_20px_rgba(61,52,41,0.12)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt={`${currentLabel ?? "Review photo"} at ${cafeName}`}
            className={`w-full object-cover ${imageHeightClass}`}
            loading={index === 0 ? "eager" : "lazy"}
            referrerPolicy="no-referrer"
          />
        </button>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute inset-y-0 left-2 z-2 my-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-white/85 text-xl leading-none text-ink"
              onClick={() => go(-1)}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute inset-y-0 right-2 z-2 my-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-white/85 text-xl leading-none text-ink"
              onClick={() => go(1)}
              aria-label="Next photo"
            >
              ›
            </button>
            <div
              className="absolute bottom-2.5 left-1/2 z-2 flex -translate-x-1/2 gap-1.5"
              role="tablist"
              aria-label="Review photos"
            >
              {images.map((url, dotIndex) => (
                <button
                  key={url}
                  type="button"
                  role="tab"
                  aria-selected={dotIndex === index}
                  aria-label={`Photo ${dotIndex + 1}`}
                  className={`rounded-full border-0 p-0 ${
                    dotIndex === index
                      ? "h-1.5 w-4 bg-white"
                      : "h-1.5 w-1.5 bg-white/55"
                  }`}
                  onClick={() => onIndexChangeAction(dotIndex)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <PhotoLightbox
        openUrl={openUrl}
        openIndex={openIndex}
        images={images}
        labels={labels}
        cafeName={cafeName}
        onClose={() => setOpenUrl(null)}
        onNavigate={setOpenUrl}
      />
    </>
  );
}
