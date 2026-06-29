"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { GetFriends, MeResponse } from "shared/types";
import { api } from "@/lib/api/client";
import Link from "next/link";
import Image from "next/image";
import LoadingIndicator from "@/app/components/loading-indicator";
import { UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { queryClient } from "@/lib/query";
import FriendRemoveConfirmation from "./friend-remove-confirmation";

interface Props {
  userId?: string;
  className?: string;
}

export default function FriendsList({ userId, className }: Props) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [friendToRemove, setFriendToRemove] = useState<
    GetFriends["friends"][0] | null
  >(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<
    GetFriends,
    Error,
    InfiniteData<GetFriends>,
    readonly unknown[],
    number | null
  >({
    queryKey: userId ? ["user", userId, "friends"] : ["me", "friends"],

    queryFn: async ({ pageParam }) => {
      let result;

      if (userId) {
        result = await api.users.friends.getUser(userId, {
          cursor: pageParam ?? undefined,
          limit: 8,
        });
      } else {
        result = await api.users.friends.get({
          cursor: pageParam ?? undefined,
          limit: 4,
        });
      }

      if (!result.ok) {
        throw result.error;
      }
      return result.data;
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const forbidden = error && "code" in error && error.code === "FORBIDDEN";

  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current) return;

    const bottom =
      scrollAreaRef.current.scrollHeight - scrollAreaRef.current.scrollTop <=
      scrollAreaRef.current.clientHeight + 50;

    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [scrollAreaRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  async function handleRemoveFriend() {
    if (!friendToRemove) return;

    const result = await api.users.friends.remove(friendToRemove.publicId);

    if (result.ok) {
      toast.success("Amigo removido com sucesso!");

      queryClient.setQueryData(
        ["me", "friends"],
        (oldData: InfiniteData<GetFriends>) => {
          if (!oldData) return undefined;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              return {
                ...page,
                friends: page.friends.filter(
                  (friend) => friend.publicId !== friendToRemove.publicId,
                ),
              };
            }),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["me"] });
    } else {
      toast.error("Não foi possível remover este amigo.");
    }

    setFriendToRemove(null);
  }

  if (status === "pending") {
    return (
      <div className="flex flex-col h-full justify-center items-center text-xl">
        <div className="inline-flex flex-row items-center gap-4 justify-center py-8 text-gray-700">
          <LoadingIndicator className="size-5" />
          Carregando...
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col h-full justify-center items-center text-xl text-zinc-900">
        {forbidden ? (
          <div className="text-center py-8">
            Você não pode ver os amigos deste usuário
          </div>
        ) : (
          <div className="text-center py-8 text-red-500">
            Erro ao carregar amizades
          </div>
        )}
      </div>
    );
  }

  if (data.pages.length === 0 || data.pages[0].friends.length === 0) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-xl text-zinc-900">
        <div className="text-center py-8">Nenhum amigo.</div>
      </div>
    );
  }

  return (
    <div
      className={`${className ? className : ""} flex flex-col p-6 bg-gray-50 rounded-lg border border-zinc-200 overflow-auto`}
      ref={scrollAreaRef}
      onScroll={handleScroll}
    >
      <div className="grid grid-cols-2 gap-4">
        {data.pages.flatMap((page) => {
          return page.friends.map((friend) => (
            <Link
              key={friend.publicId}
              href={`/users/${friend.publicId}`}
              className="
                  flex flex-row items-center
                  p-4 gap-6
                  border border-gray-200 rounded-xl
                  bg-white hover:shadow-md
                  transition-shadow cursor-pointer
                "
            >
              <Image
                unoptimized
                src={friend.avatarUrl}
                alt={`Foto de perfil de ${friend.name}`}
                width={48}
                height={48}
                className="rounded-full border-4 border-white"
              />
              <h4 className="text-lg font-semibold text-gray-800">
                {friend.name}
              </h4>

              {!userId && (
                <div className="flex-1 flex flex-row justify-end">
                  <button
                    type="button"
                    className="rounded-full p-2 text-gray-800 hover:bg-red-100 hover:text-red-700 transition-colors duration-300 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFriendToRemove(friend);
                    }}
                  >
                    <UserRoundX />
                  </button>
                </div>
              )}
            </Link>
          ));
        })}
      </div>

      {hasNextPage && (
        <div className="h-10 flex justify-center items-center mt-4">
          {isFetchingNextPage ? (
            <div className="inline-flex flex-row items-center gap-4 justify-center py-8 text-gray-500">
              <LoadingIndicator className="size-5" />
              Carregando...
            </div>
          ) : (
            <span className="text-xs text-gray-400">
              Role para carregar mais
            </span>
          )}
        </div>
      )}

      {friendToRemove && (
        <FriendRemoveConfirmation
          friendName={friendToRemove.name}
          onCancel={() => setFriendToRemove(null)}
          onRemove={handleRemoveFriend}
        />
      )}
    </div>
  );
}
