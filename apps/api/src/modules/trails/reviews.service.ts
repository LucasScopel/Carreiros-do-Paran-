import { NotFoundError } from "@/utils/errors";
import { Prisma, prisma } from "database";
import { TrailReviewResponse, TrailReviewsResponse } from "shared/types";
import { getUserAvatarURL } from "shared/utils";

interface GetTrailReviewsParams {
  trailPublicId: string;
  limit: number;
  cursor: number | null;
}

export async function getTrailReviews({
  trailPublicId,
  limit,
  cursor,
}: GetTrailReviewsParams): Promise<TrailReviewsResponse> {
  const trail = await prisma.trail.findUnique({
    where: {
      publicId: trailPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  const reviews = await prisma.review.findMany({
    where: {
      trailId: trail.id,
    },

    orderBy: {
      id: "desc",
    },

    take: limit + 1,

    ...(cursor && {
      cursor: {
        id: cursor,
      },
      skip: 1,
    }),

    select: {
      id: true,
      rating: true,
      difficultyRating: true,
      comment: true,
      visitDate: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          publicId: true,
          name: true,
          hasAvatar: true,
          avatarVersion: true,
        },
      },
    },
  });

  const hasMore = reviews.length > limit;

  if (hasMore) {
    reviews.pop();
  }

  const nextCursor =
    hasMore && reviews.length > 0 ? reviews[reviews.length - 1].id : null;

  return {
    reviews: reviews.map((review) => {
      const { id, user, visitDate, rating, difficultyRating, ...rest } = review;
      const avatarUrl = getUserAvatarURL(user);
      return {
        user: {
          publicId: user.publicId,
          name: user.name,
          avatarUrl: avatarUrl,
        },
        visitDate: visitDate.toISOString(),
        rating: rating / 2,
        difficultyRating: difficultyRating / 2,
        ...rest,
      };
    }),
    nextCursor,
    hasMore,
  };
}

export async function getUserTrailReview(
  trailPublicId: string,
  userId: bigint,
): Promise<TrailReviewResponse | null> {
  const trail = await prisma.trail.findUnique({
    where: {
      publicId: trailPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  const review = await prisma.review.findUnique({
    where: {
      trailId_userId: {
        trailId: trail.id,
        userId: userId,
      },
    },
    select: {
      id: true,
      rating: true,
      difficultyRating: true,
      comment: true,
      visitDate: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          publicId: true,
          name: true,
          hasAvatar: true,
          avatarVersion: true,
        },
      },
    },
  });

  if (!review) return null;

  const { id, user, visitDate, rating, difficultyRating, ...rest } = review;
  const avatarUrl = getUserAvatarURL(user);

  return {
    user: {
      publicId: user.publicId,
      name: user.name,
      avatarUrl: avatarUrl,
    },
    visitDate: visitDate.toISOString(),
    rating: rating / 2,
    difficultyRating: difficultyRating / 2,
    ...rest,
  };
}

interface UpsertTrailReviewParams {
  comment: string;
  rating: number;
  difficultyRating: number;
  visitDate: Date;
}

export async function upsertTrailReview(
  trailPublicId: string,
  userId: bigint,
  { comment, rating, difficultyRating, visitDate }: UpsertTrailReviewParams,
) {
  const trail = await prisma.trail.findUnique({
    where: {
      publicId: trailPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  const intRating = Math.floor(rating * 2);
  const intDifficultyRating = Math.floor(difficultyRating * 2);

  await prisma.$transaction(async (tx) => {
    const oldReview = await tx.review.findUnique({
      select: {
        rating: true,
        difficultyRating: true,
      },
      where: {
        trailId_userId: {
          trailId: trail.id,
          userId: userId,
        },
      },
    });

    await tx.review.upsert({
      create: {
        comment,
        rating: intRating,
        difficultyRating: intDifficultyRating,
        visitDate,
        trailId: trail.id,
        userId,
      },
      update: {
        comment,
        rating: intRating,
        difficultyRating: intDifficultyRating,
        visitDate,
      },
      where: {
        trailId_userId: {
          trailId: trail.id,
          userId: userId,
        },
      },
    });

    const addRating = intRating - (oldReview?.rating ?? 0);
    const addDifficultyRating =
      intDifficultyRating - (oldReview?.difficultyRating ?? 0);

    await tx.trail.update({
      data: {
        reviewCount: oldReview
          ? undefined
          : {
              increment: 1,
            },
        ratingSum: {
          increment: addRating,
        },
        difficultySum: {
          increment: addDifficultyRating,
        },
      },
      where: {
        id: trail.id,
      },
    });

    if (!oldReview) {
      await tx.user.update({
        data: {
          reviewCount: {
            increment: 1,
          },
        },
        where: {
          id: userId,
        },
      });
    }
  });
}

export async function deleteTrailReview(trailPublicId: string, userId: bigint) {
  const trail = await prisma.trail.findUnique({
    where: {
      publicId: trailPublicId,
    },
    select: {
      id: true,
    },
  });

  if (!trail) {
    throw new NotFoundError();
  }

  try {
    await prisma.$transaction(async (tx) => {
      const review = await tx.review.delete({
        select: {
          rating: true,
          difficultyRating: true,
        },
        where: {
          trailId_userId: {
            trailId: trail.id,
            userId: userId,
          },
        },
      });

      await tx.user.update({
        data: {
          reviewCount: {
            decrement: 1,
          },
        },
        where: {
          id: userId,
        },
      });

      await tx.trail.update({
        data: {
          reviewCount: {
            decrement: 1,
          },
          ratingSum: {
            decrement: review.rating,
          },
          difficultySum: {
            decrement: review.difficultyRating,
          },
        },
        where: {
          id: trail.id,
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025" // Não encontrou a review da trilha
    ) {
      // Ignore
    } else {
      throw error;
    }
  }
}
