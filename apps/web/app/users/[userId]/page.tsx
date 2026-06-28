import { api } from "@/lib/api/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import FriendButton from "./_components/friend-button";
import { getCurrentUser } from "@/lib/auth";

interface UserPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { userId } = await params;

  const viewer = await getCurrentUser();

  const owner = await api.users.get(userId);

  if (!owner.ok) {
    notFound();
  }

  return (
    <div
      className="
        flex flex-col
        rounded-2xl border border-zinc-200
        bg-white
        p-8
        gap-5
      "
    >
      <div className="flex flex-row gap-10">
        <div className="flex flex-col justify-start gap-6">
          <div
            className="
              group relative
              w-64 h-64
              overflow-hidden
              rounded-full
              self-start
            "
          >
            <Image
              src={owner.data.avatarUrl}
              alt="Profile picture"
              title={owner.data.name}
              fill
              unoptimized
              className="
                rounded-full border-4 border-white
                shadow-sm object-cover
              "
            />
          </div>

          <div
            className="
            flex flex-col justify-start items-start
            mt-4 ml-4 gap-2
            text-lg text-zinc-900 font-medium"
          >
            <p>Avaliações: {owner.data.reviewCount}</p>
          </div>

          <FriendButton viewer={viewer} owner={owner.data} />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mt-6">
            <div
              className="
                group flex items-center
                gap-4 p-2
                text-3xl font-semibold text-zinc-900
              "
            >
              {owner.data.name}
            </div>
          </div>

          <div className="mt-4">
            <div
              className={`
                w-full min-h-60 p-3
                text-md whitespace-pre-line
                ${owner.data.description ? "text-zinc-900" : "italic text-zinc-500"}
              `}
            >
              {owner.data.description
                ? owner.data.description
                : "Nenhuma descrição..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
