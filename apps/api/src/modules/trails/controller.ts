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
import { PARANA_BOUNDS } from "shared/utils/parana";
import { clamp } from "shared/utils";

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

  const limit = getIntegerQueryParam(req.query, "limit", {
    min: 1,
    max: 10,
    default: 5,
  });

  const orderBy =
    typeof req.query["order_by"] === "undefined"
      ? "newest"
      : req.query["order_by"];

  if (
    typeof orderBy !== "string" ||
    !(
      orderBy === "newest" ||
      orderBy === "oldest" ||
      orderBy === "rating-desc" ||
      orderBy === "rating-asc" ||
      orderBy === "difficulty-desc" ||
      orderBy === "difficulty-asc"
    )
  ) {
    throw new BadRequestError("Invalid query parameter 'order_by'");
  }

  let cursor;

  try {
    cursor =
      typeof req.query["cursor"] === "undefined" ? null : req.query["cursor"];

    if (cursor !== null) {
      if (typeof cursor !== "string") throw "";

      cursor = JSON.parse(atob(cursor));

      if (
        typeof cursor.id !== "number" ||
        typeof cursor.value === "undefined"
      ) {
        throw "";
      }
    }
  } catch {
    throw new BadRequestError("Invalid query parameter 'cursor'");
  }

  const reviews = await reviewsService.getTrailReviews({
    trailPublicId: trailId,
    limit,
    cursor,
    orderBy,
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
    min: 1,
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

export async function searchTrails(req: Request, res: Response) {
  const limit = getIntegerQueryParam(req.query, "limit", {
    min: 1,
    max: 10,
    default: 5,
  });
  const difficulty = getIntegerQueryParam(req.query, "difficulty", {
    min: 0,
    max: 4,
    default: 0,
  });
  const minLength = getIntegerQueryParam(req.query, "min_length", {
    default: 0,
  });
  const maxLength = getIntegerQueryParam(req.query, "max_length", {
    default: 30,
  });
  const minDuration = getIntegerQueryParam(req.query, "min_duration", {
    default: 0,
  });
  const maxDuration = getIntegerQueryParam(req.query, "max_duration", {
    default: 600,
  });

  const orderBy =
    typeof req.query["order_by"] !== "undefined"
      ? req.query["order_by"]
      : "highest-rated";
  if (orderBy !== "highest-rated" && orderBy !== "lowest-rated") {
    throw new BadRequestError(
      `Query parameter 'order_by' needs to be 'highest-rated' or 'lowest-rated'`,
    );
  }

  let bounds: number[] = [];
  if (Array.isArray(req.query["bounds"])) {
    bounds = req.query["bounds"].map(Number);

    bounds[0] = clamp(bounds[0], PARANA_BOUNDS[0], PARANA_BOUNDS[2]);
    bounds[1] = clamp(bounds[1], PARANA_BOUNDS[1], PARANA_BOUNDS[3]);
    bounds[2] = clamp(bounds[2], PARANA_BOUNDS[0], PARANA_BOUNDS[2]);
    bounds[3] = clamp(bounds[3], PARANA_BOUNDS[1], PARANA_BOUNDS[3]);

    if (
      bounds.length !== 4 ||
      bounds.some(isNaN) ||
      bounds[0] > bounds[2] ||
      bounds[1] > bounds[3]
    ) {
      throw new BadRequestError("Invalid query parameter 'bounds'");
    }
  } else if (typeof req.query["bounds"] === "undefined") {
    bounds = PARANA_BOUNDS.map((x) => x);
  } else {
    throw new BadRequestError("Invalid query parameter 'bounds'");
  }

  let cursor = null;
  if (typeof req.query["cursor"] === "string") {
    try {
      cursor = JSON.parse(atob(req.query["cursor"]));
    } catch {
      throw new BadRequestError("Invalid query parameter 'cursor'");
    }

    if (typeof cursor.id !== "number" || typeof cursor.rating !== "number") {
      throw new BadRequestError("Invalid query parameter 'cursor'");
    }
  }

  const result = await trailsService.searchTrails({
    bounds,
    difficulty,
    minLength,
    maxLength,
    minDuration,
    maxDuration,
    limit,
    cursor,
    orderBy,
  });

  res.json(result);
}
