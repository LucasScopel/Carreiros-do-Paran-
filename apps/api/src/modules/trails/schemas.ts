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
  length: zod.number().gt(0),
  duration: zod.int().gt(0),
});

export const updateTrailSchema = newTrailSchema
  .extend({
    deletedImages: zod.array(zod.int()),
  })
  .partial();

export const updateTrailImagesSchema = zod.object({
  deletedImages: zod.array(zod.int()),
  orderedImages: zod.array(zod.int()),
});
