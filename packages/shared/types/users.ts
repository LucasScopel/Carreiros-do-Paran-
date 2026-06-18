export interface MeResponse {
  name: string;
  description: string;
  publicId: string;
  email: string;
  birthDate: Date;
  avatarUrl: string;
  hasCustomAvatar: boolean;
  createdAt: Date;
  admin: boolean;
}
