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
