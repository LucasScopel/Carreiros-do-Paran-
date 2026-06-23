import { Request, Response } from "express";
import {
  newTrailSchema,
  updateTrailImagesSchema,
  updateTrailSchema,
} from "./schemas";
import * as trailsService from "./service";
import { BadRequestError } from "@/utils/errors";

interface ParamsDictionary {
  [key: string]: string | string[];
  [key: number]: string;
}

function getTrailIdParam(params: ParamsDictionary) {
  if (!params.trailId) {
    throw new BadRequestError("Missing trail id");
  }
  return params.trailId as string;
}

function getIntegerQueryParam(
  query: qs.ParsedQs,
  property: string,
  options: { max?: number },
): number;

function getIntegerQueryParam<T>(
  query: qs.ParsedQs,
  property: string,
  options: { max?: number; default: T },
): number | T;

function getIntegerQueryParam<T>(
  query: qs.ParsedQs,
  property: string,
  options: {
    max?: number;
    default?: T;
  } = {},
): number | T {
  if (
    typeof query[property] === "undefined" &&
    typeof options.default !== "undefined"
  ) {
    return options.default;
  }

  let value = 0;

  if (
    typeof query[property] !== "string" ||
    isNaN((value = parseInt(query[property], 10)))
  ) {
    throw new BadRequestError(
      `Query parameter '${property}' needs to be an integer`,
    );
  }

  if (typeof options.max === "number" && value > options.max) {
    throw new BadRequestError(
      `Query parameter '${property}' can't be bigger than ${options.max}`,
    );
  }

  return value;
}

export async function newTrail(req: Request, res: Response) {
  const data = newTrailSchema.parse(req.body);

  const publicId = await trailsService.newTrail(
    data.name,
    data.coordinates,
    data.description,
    data.address,
    data.length,
    data.duration,
  );

  res.send({ publicId: publicId });
}

export async function updateTrail(req: Request, res: Response) {
  const trailId = getTrailIdParam(req.params);

  const data = updateTrailSchema.parse(req.body);

  await trailsService.updateTrail(trailId, data);

  res.sendStatus(204);
}

export async function uploadTrailImages(req: Request, res: Response) {
  const trailId = getTrailIdParam(req.params);

  if (!req.files || !Array.isArray(req.files) || !(req.files.length > 0)) {
    throw new BadRequestError("Invalid image file(s)");
  }

  const imageIds = await trailsService.uploadTrailImages(trailId, req.files);

  res.send(imageIds);
}

export async function updateTrailImages(req: Request, res: Response) {
  const trailId = getTrailIdParam(req.params);

  const data = updateTrailImagesSchema.parse(req.body);

  await trailsService.updateTrailImages(trailId, data);

  res.sendStatus(204);
}

export async function getTrail(req: Request, res: Response) {
  const trailId = getTrailIdParam(req.params);

  const trail = await trailsService.getTrail(trailId);

  res.send(trail);
}

export async function removeTrail(req: Request, res: Response) {
  const trailId = getTrailIdParam(req.params);

  await trailsService.removeTrail(trailId);

  res.sendStatus(204);
}

export async function getAllTrails(_req: Request, res: Response) {
  const trails = await trailsService.getAllTrails();

  res.send(trails);
}

export async function getTrailReviews(req: Request, res: Response) {
  const trailId = getTrailIdParam(req.params);
  const cursor = getIntegerQueryParam(req.query, "cursor", {
    default: null,
  });
  const limit = getIntegerQueryParam(req.query, "limit", {
    max: 10,
    default: 5,
  });

  const reviews = await trailsService.getTrailReviews({
    trailPublicId: trailId,
    cursor,
    limit,
  });

  res.send(reviews);
}
