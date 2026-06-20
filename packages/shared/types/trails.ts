export interface TrailResponse {
  images: {
    id: number;
    url: string;
  }[];
  point: {
    lon: number;
    lat: number;
  };
  length: number;
  publicId: string;
  name: string;
  description: string;
  address: string;
  duration: number;
  reviewCount: number;
  averageRating: number;
}

export interface TrailItemResponse {
  publicId: string;
  name: string;
}
