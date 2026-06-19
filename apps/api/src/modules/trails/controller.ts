import { Request, Response } from "express";
import { newTrailSchema, updateTrailSchema } from "./schemas";
import * as trailService from "./service";

export async function newTrail(req: Request, res: Response) {
  const data = newTrailSchema.parse(req.body);

  const { token, trail } = await trailService.newTrail(
data.name,
data.point,
data.description,
data.address,
data.distance,
data.duration,
  );
  res.sendStatus(204);
}

export async function updateTrail(req: Request, res: Response) {
  const data = updateTrailSchema.parse(req.body);

  res.sendStatus(204);
}
