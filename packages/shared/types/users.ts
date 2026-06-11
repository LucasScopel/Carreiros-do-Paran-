export interface MeResponse {
  name: string;
  publicId: string;
  email: string;
  birthDate: Date;
  avatarUrl: string | null;
  createdAt: Date;
  admin: boolean;
}
