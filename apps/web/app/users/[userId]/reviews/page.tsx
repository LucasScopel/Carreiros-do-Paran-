import { api } from "@/lib/api/server";
import { Star, StarHalf } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { GetUserResponse, GetUserReviewsResponse } from "shared/types";

function Rating({
  label,
  rating,
  icon,
}: {
  label: string;
  rating: number;
  icon: "star" | "flame";
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium">{label}</p>

      <div className="relative">
        <div className="flex gap-1 fill-zinc-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} fill="current" strokeWidth={0} />
          ))}
        </div>
        <div className="flex gap-1 absolute top-0 stroke-zinc-800 fill-yellow-300">
          {Array.from({ length: Math.floor(rating) }).map((_, i) => (
            <Star key={i} fill="current" stroke="current" strokeWidth={1} />
          ))}
          {rating > Math.floor(rating) ? (
            <StarHalf fill="current" stroke="current" strokeWidth={1} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ReviewTile({
  user,
  review,
}: {
  user: GetUserResponse;
  review: GetUserReviewsResponse;
}) {
  return (
    <div className="flex flex-col p-4 gap-6 bg-gray-50 rounded-lg border border-zinc-200">
      <div className="flex flex-row items-center gap-6">
        <div className="relative w-10 h-10">
          <Image
            unoptimized
            src={user.avatarUrl}
            alt="Profile picture"
            fill
            className="rounded-full object-cover"
          />
        </div>

        <p className="font-medium text-lg">{user.name}</p>

        <p className="flex-1 text-right font-medium">
          Data da visita: {new Date(review.visitDate).toLocaleDateString()}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-medium text-2xl">{review.trail.name}</p>

        <div className="flex flex-row gap-10">
          <div className="flex flex-col gap-4">
            <Rating label="Nota geral" rating={review.rating} icon="star" />
            <Rating
              label="Dificuldade"
              rating={review.difficultyRating}
              icon="flame"
            />
          </div>

          <div className="w-[1px] h-full bg-zinc-300" />

          <div className="flex-1 flex flex-col gap-2">
            <p className="text-sm font-medium">Comentário</p>

            {review.comment.length === 0 ? (
              <p className="italic text-zinc-500 text-md">Nenhum comentário.</p>
            ) : (
              <p className="text-md whitespace-pre-line">{review.comment}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface UserReviewsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserPage({ params }: UserReviewsPageProps) {
  const { userId } = await params;

  const user = await api.users.get(userId);

  if (!user.ok) {
    notFound();
  }

  const result = await api.users.getReviews(user.data.publicId);
  const forbidden = !result.ok && result.error.code === "FORBIDDEN";
  const reviews = result.ok ? result.data : null;

  return (
    <div
      className="
        flex-1 flex flex-col
        rounded-2xl border border-zinc-200
        bg-white
        p-8
      "
    >
      <p className="text-xl text-zinc-900">
        Avaliações de <span className="font-semibold">{user.data.name}</span>
      </p>

      <div className="h-[1px] w-full mt-4 mb-8 bg-zinc-300" />

      {reviews === null || reviews.length === 0 ? (
        <div className="flex flex-col h-full justify-center items-center text-xl text-zinc-900">
          {forbidden
            ? "Você não pode ver as avaliações desse usuário"
            : reviews?.length === 0
              ? "Nenhuma avaliação ainda"
              : "Não foi possível carregar as avaliações"}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((review) => (
            <ReviewTile
              key={review.trail.publicId}
              user={user.data}
              review={review}
            />
          ))}
        </div>
      )}
    </div>
  );
}
