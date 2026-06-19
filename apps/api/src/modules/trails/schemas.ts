import * as zod from "zod";

export const newTrailSchema = zod.object({
  name: zod.string(),
  point: zod
    .string()
    .regex(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/)
    .transform((val) => {
      const parts = val.split(",");
      const lat = Number(parts[0]);
      const lon = Number(parts[1].trim());
      return { lat, lon };
    }),
  description: zod.string(),
  address: zod.string(),
  length: zod.number(),
  duration: zod.number(),
});

export const updateTrailSchema = newTrailSchema.partial();
