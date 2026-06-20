export interface GeoPoint {
  lon: number;
  lat: number;
}

export interface TrailResponse {
  images: {
    id: number;
    url: string;
  }[];
  point: GeoPoint;
  length: number;
  publicId: string;
  name: string;
  description: string;
  address: string;
  duration: number;
  difficulty: string;
  reviewCount: number;
  averageRating: number;
}

export interface TrailItemResponse {
  publicId: string;
  name: string;
}
