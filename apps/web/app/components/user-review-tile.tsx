import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GetUserResponse, GetUserReviewsResponse } from "shared/types";
import Rating from "./rating";

export default function UserReviewTile({
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

      <div className="flex flex-col gap-4 mt-2">
        <div>
          <Link
            href={`/trails/${review.trail.publicId}`}
            className="
              inline-flex justify-start items-center
              rounded-md
              font-medium text-2xl text-slate-800
              transition-all duration-300
              cursor-pointer hover:underline
              group relative whitespace-nowrap
            "
          >
            <span>{review.trail.name}</span>
            <ArrowRight className="absolute right-0 h-6 w-6 translate-x-6 opacity-0 transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-100" />
          </Link>
        </div>

        <div className="flex flex-row gap-10">
          <div className="flex flex-col gap-4">
            <Rating
              label="Nota geral"
              rating={review.rating}
              icon="star"
              tooltip="right"
            />
            <Rating
              label="Dificuldade"
              rating={review.difficultyRating}
              icon="flame"
              tooltip="right"
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
