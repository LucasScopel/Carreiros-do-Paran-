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
