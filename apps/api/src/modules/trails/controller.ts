import { Request, Response } from "express";
import { newTrailSchema, updateTrailSchema } from "./schemas";

export async function newTrail(req: Request, res: Response) {
  const data = newTrailSchema.parse(req.body);

  res.sendStatus(204);
}

export async function updateTrail(req: Request, res: Response) {
  const data = updateTrailSchema.parse(req.body);

  res.sendStatus(204);
}
