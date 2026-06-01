"use client";

import { CopyAddressButton } from "@/app/components/copy-address-button";
import { FakeReceiptBarcode } from "@/app/components/fake-receipt-barcode";
import { ReviewPhotoCarousel } from "@/app/components/review-photo-carousel";
import { MatchaSpotSection } from "@/app/components/matcha-spot-section";
import { YelpStars } from "@/app/components/yelp-stars";
import type { MatchaCafe } from "@/lib/types";
import { useState } from "react";

type Props = {
  cafe: MatchaCafe;
  onDesk?: boolean;
};

function linkLabel(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("yelp.com")) {
    return "yelp";
  }
  if (lower.includes("google.com")) {
    return "maps";
  }
  if (lower.includes("tripadvisor")) {
    return "tripadvisor";
  }
  return "reviews";
}

export function CafeReceiptBody({ cafe, onDesk = false }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const reviewLabel = linkLabel(cafe.link);

  return (
    <div className="flex min-w-0 flex-col">
      <header className="border-b border-dashed border-ink/10 px-4 pb-4 pt-4 text-center">
        <h3
          className={`font-hand leading-none text-ink break-words ${
            onDesk ? "text-[2.35rem]" : "text-4xl"
          }`}
        >
          {cafe.name}
        </h3>
        <p className="mt-2 font-receipt text-[10px] uppercase tracking-[0.22em] text-matcha">
          {cafe.location}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft break-words">
          {cafe.summary}
        </p>
        {cafe.matchaStyle ? (
          <p className="mt-2 font-receipt text-[10px] uppercase tracking-wider text-ink-soft">
            style: {cafe.matchaStyle}
          </p>
        ) : null}
      </header>

      {cafe.drinkImages.length > 0 ? (
        <section className="border-b border-dashed border-ink/10 px-3 py-3">
          <p className="px-1 font-receipt text-[9px] uppercase tracking-[0.2em] text-ink-soft">
            signature photo
          </p>
          <div className="mt-1.5 overflow-hidden rounded-lg border border-ink/10">
            <ReviewPhotoCarousel
              images={cafe.drinkImages}
              labels={cafe.popularItems}
              cafeName={cafe.name}
              activeIndex={photoIndex}
              onIndexChangeAction={setPhotoIndex}
              onDesk={onDesk}
              size="hero"
            />
          </div>
        </section>
      ) : null}

      <div className="border-b border-dashed border-ink/10 px-4 py-3">
        <p className="font-receipt text-[9px] uppercase tracking-[0.2em] text-ink-soft">
          address
        </p>
        <div className="mt-1.5 flex flex-wrap items-start justify-between gap-2 text-sm">
          <p className="min-w-0 flex-1 leading-snug break-words text-ink">
            {cafe.address}
          </p>
          <CopyAddressButton address={cafe.address} />
        </div>
        <div className="mt-2 border-t border-dashed border-ink/10 pt-2">
          <YelpStars rating={cafe.yelpStars} reviewCount={cafe.yelpReviewCount} />
          <a
            href={cafe.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block rounded-full border border-matcha/30 bg-matcha-light/40 px-3 py-1 font-receipt text-[10px] uppercase tracking-widest text-matcha underline-offset-4 transition hover:bg-matcha-light/60 hover:underline"
          >
            open on {reviewLabel}
          </a>
        </div>
        <MatchaSpotSection cafe={cafe} onDesk={onDesk} />
      </div>

      <section className="px-3 pt-3">
        <p className="px-1 font-receipt text-[9px] uppercase tracking-[0.2em] text-ink-soft">
          menu picks
        </p>
        <div className="mt-1.5 px-1 space-y-1.5">
          {cafe.popularItems.length > 0 ? (
            cafe.popularItems.slice(0, 5).map((item, index) => (
              <div
                key={item}
                className="flex items-baseline gap-2 font-receipt text-[11px] leading-tight text-ink"
              >
                <span className="break-words">{item}</span>
                <span className="mb-0.5 min-w-2 flex-1 border-b border-dotted border-ink/35" />
                <span>pick</span>
              </div>
            ))
          ) : (
            <p className="font-receipt text-[11px] text-ink-soft">no picks listed</p>
          )}
        </div>
      </section>

      <footer className="mt-4 border-t-2 border-dashed border-ink/10 px-4 pb-4 pt-4">
        <FakeReceiptBarcode seed={`${cafe.name}-${cafe.address}`} className="mt-3" />
      </footer>
    </div>
  );
}
