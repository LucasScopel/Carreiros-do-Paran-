import CONFIG from "@/config";
import { BadRequestError, ConflictError, NotFoundError } from "@/utils/errors";
import { Prisma, prisma } from "database";
import { nanoid } from "nanoid";
import fs from "node:fs/promises";
import path from "node:path";
import { MeResponse, VisibilityLevel } from "shared/types";
import { getUserAvatarURL } from "shared/utils";
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
      reviewCount: true,
      reviewsVisibility: true,
      friendCount: true,
      friendsVisibility: true,
    },
  });

  if (!user) return null;

  const { hasAvatar, avatarVersion, birthDate, createdAt, ...rest } = user;

  const avatarUrl = getUserAvatarURL(user);

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
  data: Partial<{
    name: string;
    description: string;
    reviewsVisibility: VisibilityLevel;
  }>,
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

export async function getMyCollections(userId: bigint) {
  const collections = await prisma.trailCollection.findMany({
    where: {
      userId,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        name: "asc",
      },
    ],
    select: {
      publicId: true,
      name: true,
      isDefault: true,
      visibility: true,

      _count: {
        select: {
          trails: true,
        },
      },
    },
  });

  return collections.map((collection) => ({
    publicId: collection.publicId,
    name: collection.name,
    isDefault: collection.isDefault,
    visibility: collection.visibility,
    trailCount: collection._count.trails,
  }));
}

export async function createCollection(
  userId: bigint,
  data: {
    name: string;
    visibility: VisibilityLevel;
  },
) {
  const collectionsCount = await prisma.trailCollection.count({
    where: {
      userId,
    },
  });

  if (collectionsCount >= CONFIG.MAX_COLLECTION_COUNT) {
    throw new BadRequestError("Collection limit reached");
  }

  try {
    const publicId = nanoid();

    await prisma.trailCollection.create({
      data: {
        publicId,
        userId,
        ...data,
      },
      select: {
        publicId: true,
        name: true,
        isDefault: true,
      },
    });

    return publicId;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError("A collection with this name already exists");
    }

    throw error;
  }
}

export async function updateCollection(
  userId: bigint,
  collectionPublicId: string,
  data: Partial<{
    name: string;
    visibility: VisibilityLevel;
  }>,
) {
  const collection = await prisma.trailCollection.findFirst({
    where: {
      publicId: collectionPublicId,
      userId,
    },
    select: {
      id: true,
      isDefault: true,
    },
  });

  if (!collection) {
    throw new NotFoundError();
  }

  if (collection.isDefault && typeof data.name !== "undefined") {
    throw new BadRequestError("The default collection cannot be renamed");
  }

  try {
    await prisma.trailCollection.update({
      data,
      where: {
        id: collection.id,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError("A collection with this name already exists");
    }

    throw error;
  }
}

export async function deleteCollection(
  userId: bigint,
  collectionPublicId: string,
) {
  const collection = await prisma.trailCollection.findFirst({
    where: {
      publicId: collectionPublicId,
      userId,
    },
    select: {
      id: true,
      isDefault: true,
    },
  });

  if (!collection) {
    throw new NotFoundError();
  }

  if (collection.isDefault) {
    throw new BadRequestError("The default collection cannot be deleted");
  }

  await prisma.trailCollection.delete({
    where: {
      id: collection.id,
    },
  });
}

export async function getMyCollectionTrails(
  userId: bigint,
  collectionPublicId: string,
  {
    cursor = null,
    limit = CONFIG.MAX_COLLECTION_TRAIL_COUNT,
  }: {
    cursor?: number | null;
    limit?: number;
  } = {},
) {
  const collection = await prisma.trailCollection.findFirst({
    where: {
      publicId: collectionPublicId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!collection) {
    throw new NotFoundError();
  }

  const trails = await prisma.trailCollectionTrail.findMany({
    where: {
      collectionId: collection.id,
    },
    orderBy: {
      addedAt: "desc",
    },
    take: limit + 1,
    ...(cursor && {
      cursor: {
        collectionId_trailId: {
          collectionId: collection.id,
          trailId: cursor,
        },
      },
      skip: 1,
    }),
    include: {
      trail: {
        select: {
          publicId: true,
          name: true,
          ratingSum: true,
          difficultySum: true,
          reviewCount: true,
        },
      },
    },
  });

  const hasMore = trails.length > limit;

  if (hasMore) {
    trails.pop();
  }

  return {
    trails: trails.map((t) => {
      const {
        trail: { ratingSum, difficultySum, ...rest },
      } = t;
      return {
        rating: rest.reviewCount === 0 ? 0 : ratingSum / rest.reviewCount,
        difficulty:
          rest.reviewCount === 0 ? 0 : difficultySum / rest.reviewCount,
        ...rest,
      };
    }),
    nextCursor: hasMore ? trails[trails.length - 1].trailId : null,
  };
}

// Retorna se houve adição da trilha ou não
export async function upsertCollectionTrail(
  userId: bigint,
  collectionPublicId: string,
  trailPublicId: string,
) {
  const collection = await prisma.trailCollection.findFirst({
    where: {
      publicId: collectionPublicId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!collection) {
    throw new NotFoundError();
  }

  const trail = await prisma.trail.findUnique({
    where: {
      publicId: trailPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  const trailsCount = await prisma.trailCollectionTrail.count({
    where: {
      collectionId: collection.id,
    },
  });

  if (trailsCount >= CONFIG.MAX_COLLECTION_TRAIL_COUNT) {
    throw new BadRequestError("Collection limit reached");
  }

  try {
    await prisma.trailCollectionTrail.create({
      data: {
        collectionId: collection.id,
        trailId: trail.id,
      },
    });

    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return false;
    }

    throw error;
  }
}

export async function removeTrailFromCollection(
  userId: bigint,
  collectionPublicId: string,
  trailPublicId: string,
) {
  const collection = await prisma.trailCollection.findFirst({
    where: {
      publicId: collectionPublicId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!collection) {
    throw new NotFoundError();
  }

  const trail = await prisma.trail.findUnique({
    where: {
      publicId: trailPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  await prisma.trailCollectionTrail.deleteMany({
    where: {
      collectionId: collection.id,
      trailId: trail.id,
    },
  });
}

export async function getCollectionsContainingTrail(
  userId: bigint,
  trailPublicId: string,
) {
  const trail = await prisma.trail.findUnique({
    where: {
      publicId: trailPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  const collections = await prisma.trailCollection.findMany({
    where: {
      userId,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        name: "asc",
      },
    ],
    select: {
      publicId: true,
      name: true,
      isDefault: true,
      trails: {
        where: {
          trailId: trail.id,
        },
        select: {
          trailId: true,
        },
      },
    },
  });

  return collections.map((collection) => ({
    publicId: collection.publicId,
    name: collection.name,
    isDefault: collection.isDefault,
    containsTrail: collection.trails.length > 0,
  }));
}

export async function getUserCollections(
  viewerId: bigint | null,
  ownerPublicId: string,
) {
  const owner = await prisma.user.findUnique({
    where: {
      publicId: ownerPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!owner) {
    throw new NotFoundError();
  }

  const isOwner = viewerId === owner.id;

  let query;
  if (isOwner) query = undefined;
  else query = [{ visibility: "PUBLIC" as VisibilityLevel }];

  const collections = await prisma.trailCollection.findMany({
    where: {
      userId: owner.id,
      OR: query,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      publicId: true,
      name: true,
      _count: {
        select: {
          trails: true,
        },
      },
    },
  });

  return collections.map((collection) => ({
    publicId: collection.publicId,
    name: collection.name,
    trailCount: collection._count.trails,
  }));
}

export async function getUserCollectionTrails(
  viewerId: bigint | null,
  ownerPublicId: string,
  collectionPublicId: string,
  {
    cursor = null,
    limit = CONFIG.MAX_COLLECTION_TRAIL_COUNT,
  }: {
    cursor?: number | null;
    limit?: number;
  } = {},
) {
  const owner = await prisma.user.findUnique({
    where: {
      publicId: ownerPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!owner) {
    throw new NotFoundError();
  }

  const isOwner = viewerId === owner.id;

  const collection = await prisma.trailCollection.findFirst({
    where: {
      publicId: collectionPublicId,
      userId: owner.id,
    },
    select: {
      id: true,
      visibility: true,
    },
  });

  if (!collection) {
    throw new NotFoundError();
  }

  const canView = isOwner || collection.visibility === "PUBLIC";

  if (!canView) {
    throw new NotFoundError();
  }

  const trails = await prisma.trailCollectionTrail.findMany({
    where: {
      collectionId: collection.id,
    },
    orderBy: {
      addedAt: "desc",
    },
    take: limit + 1,
    ...(cursor && {
      cursor: {
        collectionId_trailId: {
          collectionId: collection.id,
          trailId: cursor,
        },
      },
      skip: 1,
    }),
    include: {
      trail: {
        select: {
          publicId: true,
          name: true,
          ratingSum: true,
          difficultySum: true,
          reviewCount: true,
        },
      },
    },
  });

  const hasMore = trails.length > limit;

  if (hasMore) {
    trails.pop();
  }

  return {
    trails: trails.map((t) => {
      const {
        trail: { ratingSum, difficultySum, ...rest },
      } = t;
      return {
        rating: rest.reviewCount === 0 ? 0 : ratingSum / rest.reviewCount,
        difficulty:
          rest.reviewCount === 0 ? 0 : difficultySum / rest.reviewCount,
        ...rest,
      };
    }),
    nextCursor: hasMore ? trails[trails.length - 1].trailId : null,
  };
}

export async function addFriend(requesterId: bigint, receiverPublicId: string) {
  const receiver = await prisma.user.findUnique({
    where: {
      publicId: receiverPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!receiver) {
    throw new NotFoundError();
  }

  const receiverId = receiver.id;

  if (receiverId === requesterId) {
    throw new BadRequestError(
      "Você não pode enviar um pedido de amizade para si mesmo.",
    );
  }

  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: requesterId, receiverId: receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    },
  });

  // Não existe nenhuma relação -> é um novo pedido de amizade
  if (!existingFriendship) {
    await prisma.friendship.create({
      data: {
        requesterId,
        receiverId,
      },
    });

    return "sent-request";
  }

  // A amizade já foi aceita anteriormente
  if (existingFriendship.accepted) {
    throw new BadRequestError("Vocês já são amigos.");
  }

  // O pedido está pendente, mas foi o usuário atual que enviou
  if (existingFriendship.requesterId === requesterId) {
    throw new BadRequestError(
      "Você já enviou um pedido para este usuário. Aguarde a resposta.",
    );
  }

  // O pedido está pendente e foi enviado pela outra pessoa -> aceite o pedido
  if (existingFriendship.receiverId === requesterId) {
    await prisma.$transaction([
      prisma.friendship.update({
        where: { id: existingFriendship.id },
        data: { accepted: true },
      }),

      prisma.user.update({
        where: { id: requesterId },
        data: { friendCount: { increment: 1 } },
      }),

      prisma.user.update({
        where: { id: receiverId },
        data: { friendCount: { increment: 1 } },
      }),
    ]);

    return "accepted";
  }

  throw new BadRequestError("Operação inválida.");
}

export async function removeFriend(
  requesterId: bigint,
  receiverPublicId: string,
) {
  const receiver = await prisma.user.findUnique({
    where: {
      publicId: receiverPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!receiver) {
    throw new NotFoundError();
  }

  const receiverId = receiver.id;

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: requesterId, receiverId: receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    },
  });

  if (!friendship) {
    throw new BadRequestError("Vocês não são amigos.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.friendship.delete({
      where: {
        id: friendship.id,
      },
    });

    if (friendship.accepted) {
      await tx.user.update({
        where: { id: requesterId },
        data: { friendCount: { decrement: 1 } },
      });

      await tx.user.update({
        where: { id: receiverId },
        data: { friendCount: { decrement: 1 } },
      });
    }
  });

  if (!friendship.accepted) {
    if (friendship.requesterId === requesterId) {
      return "canceled";
    }

    return "rejected";
  }

  return "ended";
}

export async function getFriends(
  userId: bigint,
  {
    cursor = null,
    limit = 5,
  }: {
    cursor?: number | null;
    limit?: number;
  } = {},
) {
  const friendships = await prisma.friendship.findMany({
    take: limit + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    where: {
      accepted: true,
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    include: {
      requester: { select: { publicId: true, name: true } },
      receiver: { select: { publicId: true, name: true } },
    },
    orderBy: {
      id: "asc",
    },
  });

  const hasMore = friendships.length > limit;

  if (hasMore) {
    friendships.pop();
  }

  const friends = friendships.map((f) => {
    const friendData = f.requesterId === userId ? f.receiver : f.requester;
    return {
      publicId: friendData.publicId,
      name: friendData.name,
      createdAt: f.createdAt,
    };
  });

  const nextCursor =
    hasMore && friends.length > 0 ? friendships[friends.length - 1].id : null;

  return {
    friends,
    nextCursor,
  };
}

export async function getReceivedFriendRequests(
  userId: bigint,
  {
    cursor = null,
    limit = 5,
  }: {
    cursor?: number | null;
    limit?: number;
  } = {},
) {
  const requests = await prisma.friendship.findMany({
    take: limit + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    where: {
      accepted: false,
      receiverId: userId,
    },
    include: {
      requester: { select: { publicId: true, name: true } },
    },
    orderBy: {
      id: "asc",
    },
  });

  const hasMore = requests.length > limit;

  if (hasMore) {
    requests.pop();
  }

  const nextCursor =
    hasMore && requests.length > 0 ? requests[requests.length - 1].id : null;

  return {
    requests: requests.map((r) => ({
      createdAt: r.createdAt,
      sender: r.requester,
    })),
    nextCursor,
  };
}

export async function getSentFriendRequests(
  userId: bigint,
  {
    cursor = null,
    limit = 5,
  }: {
    cursor?: number | null;
    limit?: number;
  } = {},
) {
  const requests = await prisma.friendship.findMany({
    take: limit + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    where: {
      accepted: false,
      requesterId: userId,
    },
    include: {
      receiver: { select: { publicId: true, name: true } },
    },
    orderBy: {
      id: "asc",
    },
  });

  const hasMore = requests.length > limit;

  if (hasMore) {
    requests.pop();
  }

  const nextCursor =
    hasMore && requests.length > 0 ? requests[requests.length - 1].id : null;

  return {
    requests: requests.map((r) => ({
      createdAt: r.createdAt,
      receiver: r.receiver,
    })),
    nextCursor,
  };
}
