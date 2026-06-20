import CONFIG from "@/config";
import { BadRequestError } from "@/utils/errors";
import { prisma } from "database";
import fs from "node:fs/promises";
import path from "node:path";
import { MeResponse } from "shared/types";
import sharp from "sharp";

/**
 * Busca os dados do usuário autenticado.
 *
 * Retorna apenas informações seguras para exposição na API.
 */
export async function getMe(userId: bigint): Promise<MeResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },

    select: {
      publicId: true,
      email: true,
      name: true,
      description: true,
      admin: true,
      createdAt: true,
      hasAvatar: true,
      avatarVersion: true,
      birthDate: true,
    },
  });

  if (!user) return null;

  const { hasAvatar, avatarVersion, birthDate, createdAt, ...rest } = user;

  const avatarUrl = hasAvatar
    ? `/uploads/avatars/${user.publicId}.webp?v=${avatarVersion}`
    : `https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(user.name)}`;

  return {
    avatarUrl,
    hasCustomAvatar: hasAvatar,
    birthDate: birthDate.toISOString(),
    createdAt: createdAt.toISOString(),
    ...rest,
  };
}

/**
 * Atualiza informações de um usuário.
 */
export async function updateUser(
  userId: bigint,
  data: Partial<{ name: string; description: string }>,
) {
  if (Object.keys(data).length === 0) return;

  await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });
}

/**
 * Faz o upload de uma nova foto de perfil para um usuário.
 */
export async function uploadAvatar(publicUserId: string, fileBuffer: Buffer) {
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

  const filePath = path.join(CONFIG.AVATARS_DIR, `${publicUserId}.webp`);

  await fs.writeFile(filePath, avatar);
}

/**
 * Atualiza a versão da foto de perfil para um usuário.
 *
 * O versionamento da foto de perfil força os navegadores
 * a buscarem novamente a imagem mesmo que já haja uma versão
 * antiga dela no cache.
 */
export async function updateAvatarVersion(userId: bigint) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      hasAvatar: true,
      avatarVersion: {
        increment: 1,
      },
    },
  });
}

/**
 * Remove a foto de perfil de um usuário.
 */
export async function removeAvatar(userId: bigint, publicUserId: string) {
  const filePath = path.join(CONFIG.AVATARS_DIR, `${publicUserId}.webp`);

  try {
    await fs.unlink(filePath);
  } catch {}

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      hasAvatar: false,
    },
  });
}
