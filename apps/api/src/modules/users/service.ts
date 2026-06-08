import { prisma } from "database";

export async function getMe(userId: bigint) {
  const user = await prisma.user.findUnique({
    where: { id: userId },

    select: {
      publicId: true,
      email: true,
      name: true,
      admin: true,
      createdAt: true,
      avatarUrl: true,
      birthDate: true,
    },
  });

  return user;
}
