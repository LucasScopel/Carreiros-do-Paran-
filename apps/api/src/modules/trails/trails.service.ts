import CONFIG from "@/config";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import { Prisma, prisma } from "database";
import { nanoid } from "nanoid";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createTrailImageFileName } from "./utils";
import { GeoCoords, TrailItemResponse, TrailResponse } from "shared/types";

export async function newTrail(
  name: string,
  coordinates: GeoCoords,
  description: string,
  address: string,
  length: number,
  duration: number,
) {
  const publicId = nanoid();

  await prisma.$executeRaw`
    INSERT INTO "Trail" (
      "publicId",
      name,
      coordinates,
      description,
      address,
      length,
      duration
    ) VALUES (
      ${publicId},
      ${name},
      ST_SetSRID(ST_MakePoint(${coordinates.lon}, ${coordinates.lat}), 4326),
      ${description},
      ${address},
      ${length},
      ${duration}
    )
  `;

  return publicId;
}

export async function updateTrail(
  publicId: string,
  data: Partial<{
    name: string;
    coordinates: GeoCoords;
    description: string;
    address: string;
    length: number;
    duration: number;
    difficulty: string;
  }>,
) {
  if (!(Object.keys(data).length > 0)) return;

  const trail = await prisma.trail.findUnique({
    where: {
      publicId: publicId,
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  await prisma.$transaction(async (tx) => {
    const { coordinates, ...rest } = data;

    if (Object.keys(rest).length > 0) {
      await tx.trail.update({
        where: {
          id: trail.id,
        },
        data: rest,
      });
    }

    if (data.coordinates !== undefined) {
      await tx.$executeRaw`
        UPDATE "Trail"
        SET coordinates = ST_SetSRID(ST_MakePoint(${data.coordinates.lon}, ${data.coordinates.lat}), 4326)
        WHERE id = ${trail.id}
      `;
    }
  });
}

export async function uploadTrailImages(
  publicId: string,
  files: Express.Multer.File[],
) {
  const trail = await prisma.trail.findUnique({
    where: {
      publicId: publicId,
    },
    include: {
      _count: {
        select: { images: true },
      },
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  if (trail._count.images >= CONFIG.MAX_TRAIL_IMAGE_COUNT) {
    throw new BadRequestError(
      `Reached limit of ${CONFIG.MAX_TRAIL_IMAGE_COUNT} images`,
    );
  }

  if (trail._count.images + files.length > CONFIG.MAX_TRAIL_IMAGE_COUNT) {
    throw new BadRequestError(
      `This amount of images will reach the limit of ${CONFIG.MAX_TRAIL_IMAGE_COUNT} images`,
    );
  }

  const oldImageCount = trail._count.images;

  const images: {
    id: number;
    format: keyof sharp.FormatEnum;
    buffer: Buffer;
  }[] = [];

  await prisma.$transaction(async (tx) => {
    let i = 0;

    for (const file of files) {
      const image = sharp(file.buffer);

      let metadata;
      try {
        metadata = await image.metadata();
      } catch {
        throw new BadRequestError("Invalid image file");
      }

      if (
        !metadata.width ||
        !metadata.height ||
        metadata.width < 256 ||
        metadata.height < 256
      ) {
        throw new BadRequestError("Image should be at least 256x256 pixels");
      }

      const { id: imageId } = await tx.trailImage.create({
        data: {
          position: oldImageCount + i,
          trailId: trail.id,
          format: metadata.format,
        },
      });

      images.push({
        id: imageId,
        format: metadata.format,
        buffer: file.buffer,
      });

      i++;
    }
  });

  for (const image of images) {
    const filePath = path.join(
      CONFIG.TRAILS_IMG_DIR,
      createTrailImageFileName(publicId, image.id, image.format),
    );

    await fs.writeFile(filePath, image.buffer);
  }

  return images.map((image) => image.id);
}

// Ficou feio. E provavelmente não muito robusto.
export async function updateTrailImages(
  publicId: string,
  data: {
    deletedImages: number[];
    orderedImages: number[];
  },
) {
  if (!(data.deletedImages.length > 0) && !(data.orderedImages.length > 0))
    return;

  const trail = await prisma.trail.findUnique({
    where: {
      publicId: publicId,
    },
    include: {
      _count: {
        select: { images: true },
      },
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  // Remove possíveis entradas duplicadas
  const uniqueDeleted = [...new Set(data.deletedImages)];
  const uniqueOrdered = [...new Set(data.orderedImages)]; // preserva ordem

  if (uniqueDeleted.length > CONFIG.MAX_TRAIL_IMAGE_COUNT) {
    throw new BadRequestError("Too many images to delete");
  }

  const overlap = uniqueDeleted.some((id) => uniqueOrdered.includes(id));

  if (overlap) {
    throw new BadRequestError(
      "An image cannot be deleted and ordered at the same time",
    );
  }

  const filesToDelete: Prisma.TrailImageModel[] = [];

  await prisma.$transaction(async (tx) => {
    let deletedCount = 0;

    if (uniqueDeleted.length > 0) {
      // Se houver alguma imagem a deletar, procure por elas no
      // banco de dados e garanta que elas pertencem à trilha sendo editada
      const result = await tx.trailImage.findMany({
        where: {
          id: {
            in: uniqueDeleted,
          },
          trailId: trail.id,
        },
      });

      const imagesToDelete = [];

      for (const image of result) {
        imagesToDelete.push(image.id);

        // A exclusão dos arquivos acontece depois da conclusão da transaction
        filesToDelete.push(image);
      }

      deletedCount = imagesToDelete.length;

      await tx.trailImage.deleteMany({
        where: {
          id: {
            in: imagesToDelete,
          },
          trailId: trail.id,
        },
      });
    }

    if (uniqueOrdered.length === 0) return;

    // Essa é a quantidade de imagens que a trilha deve ter depois das exclusões acima
    const remainingCount = trail._count.images - deletedCount;

    // O cliente deve sempre enviar a ordem de todas as imagens, ou nada
    if (uniqueOrdered.length !== remainingCount) {
      throw new BadRequestError("Ordered images list is incomplete");
    }

    const count = await tx.trailImage.count({
      where: {
        id: {
          in: uniqueOrdered,
        },
        trailId: trail.id,
      },
    });

    // Todas as imagens ordenadas devem existir
    // e pertencer à trilha sendo editada
    if (count !== remainingCount) {
      throw new BadRequestError(
        "One or more images to be ordered don't belong to this trail or don't exist",
      );
    }

    // Reconstrói o posicionamento das imagens
    // baseado na ordem provida pelo cliente
    for (let i = 0; i < uniqueOrdered.length; i++) {
      await tx.trailImage.update({
        data: {
          position: i,
        },
        where: {
          id: uniqueOrdered[i],
          trailId: trail.id,
        },
      });
    }
  });

  // Os arquivos de imagem em si são excluídos apenas
  // depois que a transaction é concluída com sucesso
  await Promise.allSettled(
    filesToDelete.map(async (deleted) => {
      const filePath = path.join(
        CONFIG.TRAILS_IMG_DIR,
        createTrailImageFileName(publicId, deleted.id, deleted.format),
      );

      await fs.unlink(filePath);
    }),
  );
}

export async function getTrail(publicId: string): Promise<TrailResponse> {
  const [maybeTrail, coordinates] = await Promise.all([
    prisma.trail.findUnique({
      where: {
        publicId: publicId,
      },
      include: {
        images: {
          select: {
            id: true,
            format: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    }),

    prisma.$queryRaw<GeoCoords[]>`
      SELECT
        ST_X(coordinates::geometry) AS lon,
        ST_Y(coordinates::geometry) AS lat
      FROM "Trail"
      WHERE "publicId" = ${publicId}
    `,
  ]);

  if (!maybeTrail) {
    throw new NotFoundError();
  }

  const { id, images, ratingSum, difficultySum, ...trail } = maybeTrail;

  return {
    ...trail,
    rating: trail.reviewCount === 0 ? 0 : ratingSum / 2 / trail.reviewCount,
    difficulty:
      trail.reviewCount === 0 ? 0 : difficultySum / 2 / trail.reviewCount,
    images: images.map((image) => ({
      id: image.id,
      url: `/uploads/trails/${createTrailImageFileName(publicId, image.id, image.format)}`,
    })),
    coordinates: coordinates[0],
  };
}

export async function removeTrail(publicId: string) {
  const trail = await prisma.trail.findUnique({
    where: {
      publicId: publicId,
    },
    include: {
      images: {
        select: {
          id: true,
          format: true,
        },
      },
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  await prisma.$transaction(async (tx) => {
    // Retorna o id de todos os usuários que avaliaram essa trilha
    const reviews = await tx.review.findMany({
      where: {
        trailId: trail.id,
      },
      select: {
        userId: true,
      },
    });

    // Decrementa a quantidade de reviews dos usuários
    for (const review of reviews) {
      await tx.user.update({
        where: {
          id: review.userId,
        },
        data: {
          reviewsCount: {
            decrement: 1,
          },
        },
      });
    }

    // Remover a trilha vai automaticamente remover as
    // imagens e reviews dela, por conta do onCascade
    await tx.trail.delete({
      where: {
        id: trail.id,
      },
    });
  });

  await Promise.allSettled(
    trail.images.map(async (image) => {
      const filePath = path.join(
        CONFIG.TRAILS_IMG_DIR,
        createTrailImageFileName(publicId, image.id, image.format),
      );

      await fs.unlink(filePath);
    }),
  );
}

export async function getAllTrails(): Promise<TrailItemResponse[]> {
  const trails = await prisma.trail.findMany({
    select: {
      publicId: true,
      name: true,
    },
  });

  return trails;
}
