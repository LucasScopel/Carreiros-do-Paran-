type GetUserAvatarURLType =
  | {
      hasAvatar: false;
      name: string;
      publicId?: string;
      avatarVersion?: number;
    }
  | {
      hasAvatar: true;
      name: string;
      publicId: string;
      avatarVersion: number;
    };

export function getUserAvatarURL(user: GetUserAvatarURLType) {
  return user.hasAvatar
    ? `/uploads/avatars/${user.publicId}.webp?v=${user.avatarVersion}`
    : `https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
}
