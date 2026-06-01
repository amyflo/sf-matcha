import type { MatchaCafe } from "@/lib/types";

/**
 * Static card for UI iteration. Edit this file to preview layout changes
 * without running a search.
 */
export const EXAMPLE_CAFE: MatchaCafe = {
  name: "Sippo",
  location: "Outer Sunset",
  address: "478 48th Ave, San Francisco, CA 94121",
  link: "https://www.yelp.com/biz/sippo-san-francisco",
  yelpStars: 4.5,
  yelpReviewCount: 428,
  matchaStyle: "ceremonial + cozy",
  summary:
    "Tiny sunset spot with thoughtful ceremonial pours and a calm, unhurried bar. Regulars rave about the hojicha soft serve after matcha.",
  popularItems: [
    "ceremonial matcha",
    "matcha latte",
    "hojicha soft serve",
    "seasonal wagashi",
  ],
  drinkImages: [
    "https://images.unsplash.com/photo-1515823064-24b604ea2108?w=1200&q=85",
    "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80",
    "https://images.unsplash.com/photo-1536256455177-954ef16810d8?w=800&q=80",
  ],
};
