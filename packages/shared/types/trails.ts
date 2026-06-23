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
  averageRating: number;
  difficulty: number;
}

export interface TrailItemResponse {
  publicId: string;
  name: string;
}

export interface TrailReviewsResponse {
  reviews: {
    id: number;
    rating: number;
    difficultyRating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      publicId: string;
      name: string;
      avatarUrl: string;
    };
  }[];
  nextCursor: number | null;
  hasMore: boolean;
}
