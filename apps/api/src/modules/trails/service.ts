import { NotFoundError } from "@/utils/errors";
import { prisma } from "database";
import { nanoid } from "nanoid";

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
