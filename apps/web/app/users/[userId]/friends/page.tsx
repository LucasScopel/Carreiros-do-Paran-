import FriendsList from "@/app/components/friends-list";
import { api } from "@/lib/api/server";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ProfileFriendsPage({ params }: Props) {
  const { userId } = await params;

  const user = await api.users.get(userId);

  if (!user.ok) {
    notFound();
  }

  return (
    <div className="relative w-full h-[calc(100vh-224px)]">
      <div className="absolute inset-0 flex flex-col">
        <div
          className="
            flex-1 flex flex-col
            rounded-2xl border border-zinc-200
            bg-white
            p-8 h-full overflow-hidden
          "
        >
          <div className="flex flex-row items-center justify-between">
            <p className="text-xl text-zinc-900">
              Amigos de <span className="font-semibold">{user.data.name}</span>{" "}
              ({user.data.friendCount})
            </p>
          </div>

          <div className="h-[1px] w-full mt-4 mb-4 bg-zinc-300" />

          <div className="flex-1 overflow-y-auto p-4 bg-white">
            <FriendsList className="h-full" userId={user.data.publicId} />
          </div>
        </div>
      </div>
    </div>
  );
}
