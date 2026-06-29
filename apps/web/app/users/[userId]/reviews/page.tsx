import UserReviewTile from "@/app/components/user-review-tile";
import { api } from "@/lib/api/server";
import { notFound } from "next/navigation";

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
        Avaliações de <span className="font-semibold">{user.data.name}</span> (
        {user.data.reviewCount})
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
            <UserReviewTile
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
