import { VisibilityLevel } from "./users";

export interface GeoCoords {
  lon: number;
  lat: number;
}

export interface TrailResponse {
  images: {
    id: number;
    url: string;
  }[];
  coordinates: GeoCoords;
  length: number;
  publicId: string;
  name: string;
  description: string;
  address: string;
  duration: number;
  reviewCount: number;
  rating: number;
  difficulty: number;
}

export interface TrailItemResponse {
  publicId: string;
  name: string;
}

export interface TrailReviewResponse {
  rating: number;
  difficultyRating: number;
  comment: string;
  visitDate: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    publicId: string;
    name: string;
    avatarUrl: string;
  };
}

export interface TrailReviewsResponse {
  reviews: TrailReviewResponse[];
  nextCursor: string | null;
}

export type GetMyCollections = {
  publicId: string;
  name: string;
  isDefault: boolean;
  visibility: VisibilityLevel;
  trailCount: number;
}[];

export type GetMyCollectionTrails = {
  trails: {
    publicId: string;
    name: string;
    reviewCount: number;
    rating: number;
    difficulty: number;
  }[];
  nextCursor: number | null;
};

export type GetUserCollections = {
  publicId: string;
  name: string;
  trailCount: number;
}[];

export type GetUserCollectionTrails = {
  trails: {
    publicId: string;
    name: string;
    reviewCount: number;
    rating: number;
    difficulty: number;
  }[];
  nextCursor: number | null;
};

export type GetCollectionsContainingTrail = {
  publicId: string;
  name: string;
  isDefault: boolean;
  containsTrail: boolean;
}[];

export const SuggestionStatus = [
  "PENDING",
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

export type SuggestionStatus = (typeof SuggestionStatus)[number];

export interface TrailSuggestion {
  publicId: string;
  name: string;
  location: string;
  length: number;
  details: string;
  status: SuggestionStatus;
  createdAt: string;
  adminNotes: string;
  user: {
    publicId: string;
    name: string;
    avatarUrl: string;
  };
}

export interface ListSuggestions {
  suggestions: TrailSuggestion[];
  nextCursor: number | null;
}

export interface TrailSearchItem {
  publicId: string;
  name: string;
  length: number;
  duration: number;
  rating: number;
  difficulty: number;
  coordinates: GeoCoords;
  imageUrl: string | null;
}

export interface TrailSearch {
  trails: TrailSearchItem[];
  nextCursor: string | null;
}
