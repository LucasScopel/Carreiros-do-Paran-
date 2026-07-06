import { NotFoundError } from "@/utils/errors";
import { Prisma, prisma } from "database";
import { nanoid } from "nanoid";
import { ListSuggestions, SuggestionStatus } from "shared/types";
import { getUserAvatarURL } from "shared/utils";

export async function createSuggestion(
  userId: bigint,
  data: {
    name: string;
    location: string;
    length: number;
    details: string;
  },
) {
  const publicId = nanoid();

  await prisma.trailSuggestion.create({
    data: {
      userId,
      publicId,
      ...data,
    },
  });

  return publicId;
}

export async function updateSuggestion(
  suggestionPublicId: string,
  data: Partial<{ status: SuggestionStatus; notes: string }>,
) {
  if (Object.keys(data).length === 0) return;

  try {
    await prisma.trailSuggestion.update({
      data: {
        status: data.status,
        adminNotes: data.notes,
      },
      where: {
        publicId: suggestionPublicId,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      throw new NotFoundError();
    }

    throw e;
  }
}

export async function removeSuggestion(suggestionPublicId: string) {
  try {
    await prisma.trailSuggestion.delete({
      where: {
        publicId: suggestionPublicId,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      throw new NotFoundError();
    }

    throw e;
  }
}

interface ListSuggestionsParams {
  status: SuggestionStatus;
  limit: number;
  cursor: number | null;
}

export async function listSuggestions({
  status,
  limit,
  cursor,
}: ListSuggestionsParams): Promise<ListSuggestions> {
  const suggestions = await prisma.trailSuggestion.findMany({
    where: {
      status,
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
      publicId: true,
      name: true,
      location: true,
      length: true,
      details: true,
      createdAt: true,
      adminNotes: true,

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

  const hasMore = suggestions.length > limit;

  if (hasMore) {
    suggestions.pop();
  }

  const nextCursor =
    hasMore && suggestions.length > 0
      ? suggestions[suggestions.length - 1].id
      : null;

  return {
    suggestions: suggestions.map((review) => {
      const { id, user, createdAt, adminNotes, ...rest } = review;
      const avatarUrl = getUserAvatarURL(user);
      return {
        user: {
          publicId: user.publicId,
          name: user.name,
          avatarUrl: avatarUrl,
        },
        createdAt: createdAt.toISOString(),
        status,
        adminNotes: adminNotes ?? "",
        ...rest,
      };
    }),
    nextCursor,
  };
}
