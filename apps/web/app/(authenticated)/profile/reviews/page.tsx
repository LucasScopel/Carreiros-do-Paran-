import { api } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/auth";
import UserReviewTile from "@/app/components/user-review-tile";

export default async function ProfileReviewsPage() {
  const user = (await getCurrentUser())!;

  const result = await api.users.getReviews(user.publicId);
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
        Minhas avaliações ({user.reviewCount})
      </p>

      <div className="h-[1px] w-full mt-4 mb-8 bg-zinc-300" />

      {reviews === null || reviews.length === 0 ? (
        <div className="flex flex-col h-full justify-center items-center text-xl text-zinc-900">
          {reviews?.length === 0
            ? "Nenhuma avaliação ainda"
            : "Não foi possível carregar as avaliações"}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((review) => (
            <UserReviewTile
              key={review.trail.publicId}
              user={{ ...user, friendshipStatus: "not-friends" }}
              review={review}
            />
          ))}
        </div>
      )}
    </div>
  );
}
