import CONFIG from "@/config";
import { BadRequestError } from "@/utils/errors";
import { prisma } from "database";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Busca os dados do usuário autenticado.
 *
 * Retorna apenas informações seguras para exposição na API.
 */
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

export async function updateUser(
  userId: bigint,
  data: Partial<{ name: string }>,
) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: data.name,
    },
  });
}

export async function uploadAvatar(
  userId: bigint,
  userPublicId: string,
  fileBuffer: Buffer,
) {
  const image = sharp(fileBuffer);

  let metadata;
  try {
    metadata = await image.metadata();
  } catch {
    throw new BadRequestError("Invalid image file");
  }

  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 128 ||
    metadata.height < 128
  ) {
    throw new BadRequestError("Image should be at least 128x128 pixels");
  }

  const avatar = await image
    .resize(256, 256, {
      fit: "cover",
    })
    .webp({ quality: 80 })
    .toBuffer();

  const filePath = path.join(CONFIG.AVATARS_DIR, `${userPublicId}.webp`);

  await fs.writeFile(filePath, avatar);
}
