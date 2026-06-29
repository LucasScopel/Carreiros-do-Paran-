import { api } from "@/lib/api/server";
import { notFound } from "next/navigation";
import UserCollectionsPage from "./_components/page";

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

  return (
    <div
      className="
        flex-1 flex flex-col
        rounded-2xl border border-zinc-200
        bg-white
        p-8
      "
    >
      <UserCollectionsPage user={user.data} />
    </div>
  );
}
