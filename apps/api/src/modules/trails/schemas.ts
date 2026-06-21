import * as zod from "zod";

export const newTrailSchema = zod.object({
  name: zod.string(),
  point: zod.object({
    lat: zod.number().min(-90).max(90),
    lon: zod.number().min(-180).max(180),
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
