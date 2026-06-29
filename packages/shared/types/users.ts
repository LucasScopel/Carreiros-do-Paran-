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
  friendCount: number;
  friendsVisibility: VisibilityLevel;
}

export interface GetUserResponse {
  publicId: string;
  name: string;
  description: string;
  avatarUrl: string;
  reviewCount: number;
  friendCount: number;
  friendshipStatus:
    | "not-friends"
    | "friends"
    | "request-sent"
    | "request-received";
}

export interface GetUserReviewsResponse {
  comment: string;
  rating: number;
  difficultyRating: number;
  visitDate: string;
  trail: {
    publicId: string;
    name: string;
  };
}

export const VisibilityLevel = {
  PUBLIC: "PUBLIC",
  FRIENDS: "FRIENDS",
  PRIVATE: "PRIVATE",
} as const;

export type VisibilityLevel =
  (typeof VisibilityLevel)[keyof typeof VisibilityLevel];

export interface RemoveFriend {
  message: "canceled" | "rejected" | "ended";
}

export interface GetFriends {
  friends: {
    publicId: string;
    name: string;
    avatarUrl: string;
    createdAt: Date;
  }[];
  nextCursor: number | null;
}

export interface GetFriendRequests {
  requests: {
    createdAt: Date;
    user: {
      publicId: string;
      name: string;
      avatarUrl: string;
    };
  }[];
  nextCursor: number | null;
}

export const VisibilityLevel = {
  PUBLIC: "PUBLIC",
  FRIENDS: "FRIENDS",
  PRIVATE: "PRIVATE",
} as const;

export type VisibilityLevel =
  (typeof VisibilityLevel)[keyof typeof VisibilityLevel];
