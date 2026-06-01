import { MATCHA_CITY, REVIEW_DOMAINS } from "@/lib/constants";
import { exa } from "@/lib/exa";
import {
  isLikelyDrinkPhoto,
  isLikelyPhoto,
  isLikelyStorefrontPhoto,
} from "@/lib/image-utils";
import type { MatchaCafe } from "@/lib/types";

type SearchHit = {
  title: string | null;
  url: string;
  image?: string;
  extras?: {
    imageLinks?: string[];
  };
};

const MAX_DRINK_IMAGES = 3;

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function isReviewUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return REVIEW_DOMAINS.some((domain) => lower.includes(domain));
}

function uniqueImages(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    if (!isLikelyPhoto(url)) {
      continue;
    }
    const key = url.split("?")[0];
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(url);
  }
  return out;
}

function collectImages(result: SearchHit): string[] {
  const images: string[] = [];
  if (result.image && isLikelyPhoto(result.image)) {
    images.push(result.image);
  }
  for (const link of result.extras?.imageLinks ?? []) {
    if (isLikelyPhoto(link)) {
      images.push(link);
    }
  }
  return images;
}

function scoreResultForCafe(cafe: MatchaCafe, result: SearchHit): number {
  const cafeName = normalizeText(cafe.name);
  const title = normalizeText(result.title ?? "");
  const url = normalizeText(result.url);
  let score = 0;

  if (isReviewUrl(result.url)) {
    score += 30;
  }

  if (title.includes(cafeName) || url.includes(cafeName.replace(/\s/g, ""))) {
    score += 80;
  }

  const words = cafeName.split(/\s+/).filter((word) => word.length > 3);
  for (const word of words) {
    if (title.includes(word) || url.includes(word)) {
      score += 15;
    }
  }

  if (cafe.link && result.url === cafe.link) {
    score += 120;
  }

  return score;
}

function pickDrinkImages(images: string[], used: Set<string>): string[] {
  const unique = uniqueImages(images).filter((url) => !used.has(url));
  const drinks: string[] = [];

  for (const url of unique) {
    if (drinks.length >= MAX_DRINK_IMAGES) {
      break;
    }
    if (isLikelyDrinkPhoto(url)) {
      drinks.push(url);
      used.add(url);
    }
  }

  for (const url of unique) {
    if (drinks.length >= MAX_DRINK_IMAGES) {
      break;
    }
    if (used.has(url) || isLikelyStorefrontPhoto(url)) {
      continue;
    }
    drinks.push(url);
    used.add(url);
  }

  return drinks;
}

function rankedResults(cafe: MatchaCafe, results: SearchHit[]): SearchHit[] {
  return [...results]
    .map((result) => ({ result, score: scoreResultForCafe(cafe, result) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ result }) => result);
}

async function fetchDrinkSearch(
  cafe: MatchaCafe,
  used: Set<string>,
): Promise<string[]> {
  const response = await exa().search(
    `"${cafe.name}" ${MATCHA_CITY} yelp food photos matcha latte drinks menu`,
    {
      type: "auto",
      numResults: 8,
      includeDomains: [...REVIEW_DOMAINS],
      contents: { extras: { imageLinks: 12 } },
    },
  );

  const images = rankedResults(cafe, response.results).flatMap((result) =>
    collectImages(result),
  );

  return pickDrinkImages(images, used);
}

async function fetchFromReviewLink(
  cafe: MatchaCafe,
  used: Set<string>,
): Promise<string[]> {
  if (!cafe.link || !isReviewUrl(cafe.link)) {
    return [];
  }

  try {
    const response = await exa().getContents([cafe.link], {
      extras: { imageLinks: 15 },
    });

    const images = response.results.flatMap((result) => collectImages(result));
    return pickDrinkImages(images, used);
  } catch {
    return [];
  }
}

async function enrichOneCafe(
  cafe: MatchaCafe,
  mainResults: SearchHit[],
  used: Set<string>,
): Promise<MatchaCafe> {
  const mainImages = rankedResults(cafe, mainResults).flatMap((result) =>
    collectImages(result),
  );

  let drinkImages = pickDrinkImages(mainImages, used);

  if (cafe.link) {
    const fromLink = await fetchFromReviewLink(cafe, used);
    for (const url of fromLink) {
      if (drinkImages.length >= MAX_DRINK_IMAGES) {
        break;
      }
      if (!drinkImages.includes(url)) {
        drinkImages.push(url);
      }
    }
  }

  if (drinkImages.length < MAX_DRINK_IMAGES) {
    const moreDrinks = await fetchDrinkSearch(cafe, used);
    for (const url of moreDrinks) {
      if (drinkImages.length >= MAX_DRINK_IMAGES) {
        break;
      }
      if (!drinkImages.includes(url)) {
        drinkImages.push(url);
      }
    }
  }

  return {
    ...cafe,
    drinkImages: drinkImages.slice(0, MAX_DRINK_IMAGES),
  };
}

export async function enrichCafesWithMedia(
  cafes: MatchaCafe[],
  mainResults: SearchHit[],
): Promise<MatchaCafe[]> {
  const used = new Set<string>();
  const enriched: MatchaCafe[] = [];

  for (const cafe of cafes) {
    enriched.push(await enrichOneCafe(cafe, mainResults, used));
  }

  return enriched;
}
