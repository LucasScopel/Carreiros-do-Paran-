import CONFIG from "@/config";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import { Prisma, prisma } from "database";
import { nanoid } from "nanoid";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createTrailImageFileName } from "./utils";

export async function newTrail(
  name: string,
  point: { lat: number; lon: number },
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
      point,
      description,
      address,
      length,
      duration
    ) VALUES (
      ${publicId},
      ${name},
      ST_SetSRID(ST_MakePoint(${point.lon}, ${point.lat}), 4326),
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
    point: { lat: number; lon: number };
    description: string;
    address: string;
    length: number;
    duration: number;
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
    const { point, ...rest } = data;

    if (Object.keys(rest).length > 0) {
      await tx.trail.update({
        where: {
          id: trail.id,
        },
        data: rest,
      });
    }

    if (data.point !== undefined) {
      await tx.$executeRaw`
        UPDATE "Trail"
        SET point = ST_SetSRID(ST_MakePoint(${data.point.lon}, ${data.point.lat}), 4326)
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

  if (uniqueDeleted.length > 10) {
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

    if (!(uniqueOrdered.length > 0)) return;

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
