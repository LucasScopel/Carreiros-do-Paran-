export interface MeResponse {
  name: string;
  description: string;
  publicId: string;
  email: string;
  birthDate: string;
  avatarUrl: string;
  hasCustomAvatar: boolean;
  createdAt: string;
  admin: boolean;
  reviewCount: number;
  reviewsVisibility: VisibilityLevel;
}

export const VisibilityLevel = {
  PUBLIC: "PUBLIC",
  FRIENDS: "FRIENDS",
  PRIVATE: "PRIVATE",
} as const;

export type VisibilityLevel =
  (typeof VisibilityLevel)[keyof typeof VisibilityLevel];
