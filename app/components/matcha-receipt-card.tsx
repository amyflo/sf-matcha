"use client";

import { CopyAddressButton } from "@/app/components/copy-address-button";
import { ReviewPhotoCarousel } from "@/app/components/review-photo-carousel";
import { ReceiptEdge } from "@/app/components/receipt-edge";
import { FakeReceiptBarcode } from "@/app/components/fake-receipt-barcode";
import { YelpStars } from "@/app/components/yelp-stars";
import { googleMapsOpenUrl } from "@/lib/maps-embed";
import type { MatchaCafe } from "@/lib/types";
import { useState } from "react";

type Props = {
  cafe: MatchaCafe;
  tiltClass?: string;
  onDesk?: boolean;
};

export function MatchaReceiptCard({
  cafe,
  tiltClass = "rotate-0",
  onDesk = false,
}: Props) {
  const previewItems = cafe.popularItems.slice(0, 3);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);
  const wrapperClass = onDesk
    ? "relative w-full shadow-[0_16px_32px_rgba(61,52,41,0.22)]"
    : `relative transition-all duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_14px_28px_rgba(61,52,41,0.12)] ${tiltClass}`;
  const googleMapsUrl = googleMapsOpenUrl(cafe.address, cafe.link, cafe.name);

  const addressParts = cafe.address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const primaryAddressLine = addressParts[0] ?? cafe.address;
  const secondaryAddressLine =
    addressParts.length > 1 ? addressParts.slice(1).join(", ") : "";
  return (
    <div className={wrapperClass}>
      <article
        className={`mx-auto flex w-full flex-col rounded-none border border-ink/10 bg-gradient-to-b from-[#fffefb] to-[#f9f5ec] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_rgba(61,52,41,0.12)] ${
          onDesk
            ? "max-w-none overflow-hidden text-[0.9375rem] sm:text-[1rem]"
            : "max-w-sm overflow-hidden text-[0.95rem]"
        }`}
      >
        <ReceiptEdge position="top" />

        {onDesk ? (
          <div className="flex flex-col">
            <header className="border-b border-dashed border-ink/20 px-3 pb-3 pt-3 text-center sm:px-4 sm:pt-4">
              <h3 className="mt-1 font-receipt text-lg leading-tight tracking-wide text-ink break-words sm:text-xl sm:leading-none">
                {cafe.name}
              </h3>
              <p className="mt-1.5 font-receipt text-[10px] tracking-wide text-ink-soft">
                {cafe.location}
              </p>
              <p className="mt-0.5 font-receipt text-[10px] tracking-wide text-ink-soft">
                Date: {new Date().toISOString().slice(0, 10)} · 10:35
              </p>
            </header>

            {cafe.drinkImages.length > 0 ? (
              <div className="border-b border-dashed border-ink/20 p-2.5 sm:p-3">
                <div
                  className="overflow-hidden border border-ink/15"
                  data-no-drag
                >
                  <ReviewPhotoCarousel
                    images={cafe.drinkImages}
                    labels={cafe.popularItems}
                    cafeName={cafe.name}
                    activeIndex={previewPhotoIndex}
                    onIndexChangeAction={setPreviewPhotoIndex}
                    onDesk
                    size="default"
                  />
                </div>
              </div>
            ) : null}

            <section className="border-b border-dashed border-ink/20 px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="font-receipt text-[9px] uppercase tracking-[0.2em] text-ink-soft">
                menu picks
              </p>
              <div className="mt-1.5 space-y-1.5">
                {previewItems.length > 0 ? (
                  previewItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-baseline gap-2 font-receipt text-[11px] leading-tight text-ink"
                    >
                      <span className="break-words">{item}</span>
                      <span className="mb-0.5 min-w-2 flex-1 border-b border-dotted border-ink/40" />
                    </div>
                  ))
                ) : (
                  <p className="font-receipt text-[11px] text-ink-soft">
                    no picks listed
                  </p>
                )}
              </div>
            </section>

            <section className="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
              <div className="flex items-start justify-between gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/50"
                  aria-label={`Open ${cafe.name} address in Google Maps`}
                >
                  <p className="font-receipt text-[10px] leading-snug text-ink break-words underline decoration-ink/30 underline-offset-2">
                    {primaryAddressLine}
                  </p>
                  {secondaryAddressLine ? (
                    <p className="mt-0.5 font-receipt text-[9px] leading-snug text-ink-soft break-words">
                      {secondaryAddressLine}
                    </p>
                  ) : null}
                </a>
                <CopyAddressButton address={cafe.address} />
              </div>
              <div className="mt-3 border-t border-dashed border-ink/30 pt-2">
                <div className="flex items-start justify-between gap-3 font-receipt text-[11px] text-ink">
                  <span>Total</span>
                  <div className="-mt-1.5">
                    <YelpStars
                      rating={cafe.yelpStars}
                      reviewCount={cafe.yelpReviewCount}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-6 text-center font-receipt text-2xl leading-none text-ink">
                THANK YOU
              </p>
              <FakeReceiptBarcode
                seed={`${cafe.name}-${cafe.address}`}
                className=""
              />
            </section>
          </div>
        ) : null}

        {!onDesk ? (
          <div className="p-4">
            <h3 className="font-receipt text-lg tracking-wide">{cafe.name}</h3>
            <p className="mt-1 font-receipt text-xs text-ink-soft">
              {cafe.location}
            </p>
            <p className="mt-2 text-sm">{cafe.summary}</p>
            <FakeReceiptBarcode
              seed={`${cafe.name}-${cafe.address}`}
              className="mt-3"
            />
          </div>
        ) : null}

        <ReceiptEdge position="bottom" />
      </article>
    </div>
  );
}
