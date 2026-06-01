export type MatchaCafe = {
  name: string;
  location: string;
  address: string;
  link: string;
  summary: string;
  matchaStyle?: string;
  yelpStars?: number;
  yelpReviewCount?: number;
  popularItems: string[];
  drinkImages: string[];
};

export type MatchaRecommendationContent = {
  cafes: Array<{
    name: string;
    location: string;
    address: string;
    link: string;
    summary: string;
    matchaStyle?: string;
    yelpStars?: number;
    yelpReviewCount?: number;
    popularItems?: string[];
  }>;
};

export type MatchaRecommendation = {
  cafes: MatchaCafe[];
  requestId: string;
};
