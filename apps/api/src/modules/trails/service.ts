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
  const trail = await prisma.trail.findUnique({
    where: {
      publicId: publicId,
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  await prisma.trail.update({
    where: {
      id: trail.id,
    },
    data: {
      name: data.name,
      description: data.description,
      address: data.address,
      length: data.length,
      duration: data.duration,
    },
  });

  if (data.point !== undefined) {
    await prisma.$executeRaw`
      UPDATE "Trail"
      SET point = ST_SetSRID(ST_MakePoint(${data.point.lon}, ${data.point.lat}), 4326)
      WHERE id = ${trail.id}
    `;
  }
}
