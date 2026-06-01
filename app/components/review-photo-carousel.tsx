"use client";

import { PhotoCarouselNavButton } from "@/app/components/photo-carousel-nav-button";
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
    size === "hero"
      ? onDesk
        ? "h-44 sm:h-56"
        : "h-40 sm:h-48"
      : onDesk
        ? "h-36 sm:h-44"
        : "h-36 sm:h-40";

  const current = images[index];
  const currentLabel = labels[index];
  const positionHint = `${index + 1} of ${images.length}`;

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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-end gap-2 bg-gradient-to-t from-ink/70 to-transparent px-3 pb-8 pt-6 sm:pb-7">
            <span className="font-receipt text-[10px] uppercase tracking-wider text-white/90">
              {positionHint}
            </span>
          </div>
        </button>

        {images.length > 1 ? (
          <>
            <PhotoCarouselNavButton
              direction="prev"
              positionHint={positionHint}
              onClick={() => go(-1)}
              className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 sm:left-2"
            />
            <PhotoCarouselNavButton
              direction="next"
              positionHint={positionHint}
              onClick={() => go(1)}
              className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 sm:right-2"
            />
            <div
              className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5"
              role="tablist"
              aria-label="Review photos"
            >
              {images.map((url, dotIndex) => (
                <button
                  key={url}
                  type="button"
                  role="tab"
                  aria-selected={dotIndex === index}
                  aria-label={`Photo ${dotIndex + 1} of ${images.length}`}
                  className="flex min-h-8 min-w-8 items-center justify-center rounded-full border-0 bg-transparent p-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    onIndexChangeAction(dotIndex);
                  }}
                >
                  <span
                    className={`block rounded-full ${
                      dotIndex === index
                        ? "h-1.5 w-4 bg-white shadow-[0_0_0_1px_rgba(61,52,41,0.15)]"
                        : "h-1.5 w-1.5 bg-white/55"
                    }`}
                  />
                </button>
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
