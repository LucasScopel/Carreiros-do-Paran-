import { prisma } from "database";

 export async function newTrail(
  name: string, 
  point: string, 
  description: string, 
  address: string, 
  distance: number, 
  duration: number
) {
    const trail = await prisma.create({
    data: {
      name,
      point,
      description,
      address,
      distance,
      duration,
    },
  });
}
