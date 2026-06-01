import { enrichCafesWithMedia } from "@/lib/enrich-cafes";
import { MATCHA_CITY, REVIEW_DOMAINS } from "@/lib/constants";
import { exa } from "@/lib/exa";
import type { DeepOutputSchema } from "exa-js";
import type {
  MatchaCafe,
  MatchaRecommendation,
  MatchaRecommendationContent,
} from "@/lib/types";

const NEIGHBORHOOD_DESC = "San Francisco neighborhood";
const ADDRESS_DESC = "Full street address in San Francisco";
const LINK_DESC =
  "Yelp, Google Maps, or Tripadvisor URL for this exact business";

const MATCHA_OUTPUT_SCHEMA = {
  type: "object" as const,
  description: "Grounded matcha cafe recommendations",
  required: ["cafes"],
  properties: {
    cafes: {
      type: "array",
      description: "Recommended matcha cafes ordered by relevance",
      items: {
        type: "object",
        required: [
          "name",
          "location",
          "address",
          "link",
          "yelpStars",
          "summary",
          "popularItems",
        ],
        properties: {
          name: { type: "string", description: "Cafe or shop name" },
          location: {
            type: "string",
            description: NEIGHBORHOOD_DESC,
          },
          address: {
            type: "string",
            description: ADDRESS_DESC,
          },
          link: {
            type: "string",
            description: LINK_DESC,
          },
          yelpStars: {
            type: "number",
            description:
              "Yelp star rating for this business (1-5, decimals ok e.g. 4.5)",
          },
          yelpReviewCount: {
            type: "number",
            description: "Yelp review count if known",
          },
          summary: {
            type: "string",
            description: "Why this spot is worth visiting for matcha",
          },
          matchaStyle: {
            type: "string",
            description: "e.g. ceremonial, latte-focused, Japanese tea house",
          },
          popularItems: {
            type: "array",
            description:
              "Up to 4 popular menu items or drinks people order at this cafe",
            items: {
              type: "string",
              description: "Menu item name",
            },
          },
        },
      },
    },
  },
} as DeepOutputSchema;

const SYSTEM_PROMPT = [
  `Recommend real matcha cafes and tea shops in ${MATCHA_CITY} only.`,
  "For each cafe include the full street address, Yelp star rating, review count when known, and a Yelp or Google Maps link to that exact business.",
  "yelpStars must come from the Yelp listing rating when a Yelp link is provided.",
  "Include popular menu items grounded in Yelp or food review sources.",
  "Prefer Yelp, Google Maps, Tripadvisor, Eater, and Infatuation over generic listicles.",
  "Collapse duplicate listings for the same business.",
  "Keep every field grounded in review sources.",
].join(" ");

function clampStars(value: unknown): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }
  return Math.min(5, Math.max(0, Math.round(value * 2) / 2));
}

function buildQuery(query: string): string {
  const trimmed = query.trim();
  if (trimmed) {
    return `${trimmed} — matcha cafes in ${MATCHA_CITY} yelp reviews`;
  }
  return `best matcha cafes in ${MATCHA_CITY} yelp google maps reviews`;
}

function parseCafes(content: unknown): MatchaCafe[] {
  if (!content || typeof content !== "object" || !("cafes" in content)) {
    return [];
  }

  const cafes = (content as MatchaRecommendationContent).cafes;
  if (!Array.isArray(cafes)) {
    return [];
  }

  return cafes.slice(0, 6).map((cafe) => ({
    name: cafe.name,
    location: cafe.location,
    address: cafe.address,
    link: cafe.link,
    summary: cafe.summary,
    matchaStyle: cafe.matchaStyle,
    yelpStars: clampStars(cafe.yelpStars),
    yelpReviewCount:
      typeof cafe.yelpReviewCount === "number" && cafe.yelpReviewCount > 0
        ? Math.round(cafe.yelpReviewCount)
        : undefined,
    popularItems: Array.isArray(cafe.popularItems)
      ? cafe.popularItems.filter(Boolean).slice(0, 4)
      : [],
    drinkImages: [],
  }));
}

export async function recommendMatchaCafes(
  query: string,
): Promise<MatchaRecommendation> {
  const searchQuery = buildQuery(query);

  const response = await exa().search(searchQuery, {
    type: "auto",
    numResults: 12,
    userLocation: "US",
    includeDomains: [...REVIEW_DOMAINS],
    systemPrompt: SYSTEM_PROMPT,
    outputSchema: MATCHA_OUTPUT_SCHEMA,
    contents: {
      highlights: true,
      extras: {
        imageLinks: 8,
      },
    },
  });

  const cafes = await enrichCafesWithMedia(
    parseCafes(response.output?.content),
    response.results,
  );

  return {
    cafes,
    requestId: response.requestId,
  };
}
