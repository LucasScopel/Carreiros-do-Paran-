"use client";

import FriendsList from "@/app/components/friends-list";
import { useMe } from "@/hooks/useMe";
import RequestsList from "./_components/requests-list";

export default function ProfileFriendsPage() {
  const user = useMe().data;

  return (
    <div
      className="
        flex-1 flex flex-col
        rounded-2xl border border-zinc-200
        bg-white
        p-8
      "
    >
      <div className="flex flex-row items-center justify-between">
        <p className="text-xl text-zinc-900" suppressHydrationWarning>
          Minhas amizades ({user?.friendCount ?? 0})
        </p>
      </div>

      <div className="h-[1px] w-full mt-4 mb-4 bg-zinc-300" />

      <div className="h-80">
        <FriendsList className="h-full" />
      </div>

      <div className="flex flex-row w-full gap-4 h-80 mt-10">
        <RequestsList kind="received" />
        <RequestsList kind="sent" />
      </div>
    </div>
  );
}
