import { Request, Response } from "express";
import { newTrailSchema, updateTrailSchema } from "./schemas";
import * as trailService from "./service";
import { BadRequestError } from "@/utils/errors";

export async function newTrail(req: Request, res: Response) {
  const data = newTrailSchema.parse(req.body);

  const publicId = await trailService.newTrail(
    data.name,
    data.point,
    data.description,
    data.address,
    data.length,
    data.duration,
  );

  res.send({ publicId: publicId });
}

export async function updateTrail(req: Request, res: Response) {
  const data = updateTrailSchema.parse(req.body);

  if (!req.params.trailId) {
    throw new BadRequestError("Missing trail id");
  }

  await trailService.updateTrail(req.params.trailId as string, data);

  res.sendStatus(204);
}
