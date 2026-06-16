export interface MeResponse {
  name: string;
  description: string;
  publicId: string;
  email: string;
  birthDate: Date;
  avatarUrl: string | null;
  createdAt: Date;
  admin: boolean;
}
