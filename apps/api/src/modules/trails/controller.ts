import { Request, Response } from "express";
import {
  upsertReviewSchema,
  newTrailSchema,
  updateTrailImagesSchema,
  updateTrailSchema,
  addSuggestionSchema,
  updateSuggestionSchema,
} from "./schemas";
import * as trailsService from "./trails.service";
import * as reviewsService from "./reviews.service";
import * as suggestionsService from "./suggestions.service";
import { BadRequestError } from "@/utils/errors";
import { getIntegerQueryParam, ParamsDictionary } from "@/utils/params";
import { SuggestionStatus } from "shared/types";

function getTrailIdParam(params: ParamsDictionary) {
  if (!params.trailId) {
    throw new BadRequestError("Missing trail id");
  }
  return params.trailId as string;
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

  const reviews = await reviewsService.getTrailReviews({
    trailPublicId: trailId,
    cursor,
    limit,
  });

  res.send(reviews);
}

export async function getMyTrailReview(req: Request, res: Response) {
  const trailId = getTrailIdParam(req.params);

  const review = await reviewsService.getUserTrailReview(trailId, req.user!.id);

  res.send({ review });
}

export async function upsertTrailReview(req: Request, res: Response) {
  const trailId = getTrailIdParam(req.params);

  const data = upsertReviewSchema.parse(req.body);

  await reviewsService.upsertTrailReview(trailId, req.user!.id, data);

  res.sendStatus(204);
}

export async function deleteTrailReview(req: Request, res: Response) {
  const trailId = getTrailIdParam(req.params);

  await reviewsService.deleteTrailReview(trailId, req.user!.id);

  res.sendStatus(204);
}

function getSuggestionIdParam(params: ParamsDictionary) {
  if (!params.suggestionId) {
    throw new BadRequestError("Missing suggestion id");
  }
  return params.suggestionId as string;
}

export async function createSuggestion(req: Request, res: Response) {
  const data = addSuggestionSchema.parse(req.body);

  const publicId = await suggestionsService.createSuggestion(
    req.user!.id,
    data,
  );

  res.status(201).json({ publicId });
}

export async function updateSuggestion(req: Request, res: Response) {
  const suggestionId = getSuggestionIdParam(req.params);

  const data = updateSuggestionSchema.parse(req.body);

  await suggestionsService.updateSuggestion(suggestionId, data);

  res.sendStatus(204);
}

export async function removeSuggestion(req: Request, res: Response) {
  const suggestionId = getSuggestionIdParam(req.params);

  await suggestionsService.removeSuggestion(suggestionId);

  res.sendStatus(204);
}

export async function listSuggestions(req: Request, res: Response) {
  const cursor = getIntegerQueryParam(req.query, "cursor", {
    default: null,
  });
  const limit = getIntegerQueryParam(req.query, "limit", {
    max: 10,
    default: 5,
  });

  const status =
    typeof req.query["status"] === "string" &&
    ["PENDING", "TODO", "IN_PROGRESS", "COMPLETED"].includes(
      req.query["status"],
    )
      ? (req.query["status"] as SuggestionStatus)
      : "PENDING";

  const result = await suggestionsService.listSuggestions({
    cursor,
    limit,
    status,
  });

  res.json(result);
}
