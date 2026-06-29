"use client";

import { useCallback, useEffect, useRef } from "react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { GetFriendRequests, MeResponse } from "shared/types";
import { api } from "@/lib/api/client";
import Link from "next/link";
import Image from "next/image";
import LoadingIndicator from "@/app/components/loading-indicator";
import { toast } from "sonner";
import { queryClient } from "@/lib/query";
import { Check, X } from "lucide-react";

interface Props {
  kind: "sent" | "received";
}

export function RequestsListContent({ kind }: Props) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<
      GetFriendRequests,
      Error,
      InfiniteData<GetFriendRequests>,
      readonly unknown[],
      number | null
    >({
      queryKey: ["me", "friends", "requests", kind],

      queryFn: async ({ pageParam }) => {
        let result;

        if (kind === "sent") {
          result = await api.users.friends.getSent({
            cursor: pageParam ?? undefined,
            limit: 8,
          });
        } else {
          result = await api.users.friends.getReceived({
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

  async function handleRemoveFriend(
    friend: GetFriendRequests["requests"][0]["user"],
  ) {
    const result = await api.users.friends.remove(friend.publicId);

    if (result.ok) {
      if (result.data.message === "ended") {
        toast.success("Amigo removido com sucesso!");
      } else if (result.data.message === "canceled") {
        toast.success("Pedido de amizade cancelado!");
      } else if (result.data.message === "rejected") {
        toast.success("Pedido de amizade rejeitado!");
      }

      queryClient.setQueryData(
        ["me", "friends", "requests", kind],
        (oldData: InfiniteData<GetFriendRequests>) => {
          if (!oldData) return undefined;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              return {
                ...page,
                requests: page.requests.filter(
                  (request) => request.user.publicId !== friend.publicId,
                ),
              };
            }),
          };
        },
      );
    } else {
      toast.error("Não foi possível remover este amigo.");
    }
  }

  async function handleAddFriend(
    friend: GetFriendRequests["requests"][0]["user"],
  ) {
    const result = await api.users.friends.add(friend.publicId);

    if (result.ok) {
      if (result.status === 201) {
        toast.success("Pedido de amizade enviado!");
      } else {
        toast.success("Amigo adicionado com sucesso!");

        queryClient.invalidateQueries({ queryKey: ["me"] });
      }

      queryClient.setQueryData(
        ["me", "friends", "requests", kind],
        (oldData: InfiniteData<GetFriendRequests>) => {
          if (!oldData) return undefined;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              return {
                ...page,
                requests: page.requests.filter(
                  (request) => request.user.publicId !== friend.publicId,
                ),
              };
            }),
          };
        },
      );
    } else {
      toast.error("Não foi possível adicionar este amigo.");
    }
  }

  if (status === "pending") {
    return (
      <div className="flex flex-1 flex-col h-full justify-center items-center text-xl">
        <div className="inline-flex flex-row items-center gap-4 justify-center py-8 text-gray-700">
          <LoadingIndicator className="size-5" />
          Carregando...
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-1 flex-col h-full justify-center items-center text-xl text-zinc-900">
        <div className="text-center py-8 text-red-500">
          Erro ao carregar pedidos de amizade{" "}
          {kind === "sent" ? "enviados" : "recebidos"}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col p-6 bg-gray-50 rounded-lg border border-zinc-200 overflow-auto"
      ref={scrollAreaRef}
      onScroll={handleScroll}
    >
      <div className="grid grid-cols-1 gap-4">
        {data.pages.flatMap((page) => {
          return page.requests.map((request) => (
            <Link
              key={request.user.publicId}
              href={`/users/${request.user.publicId}`}
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
                src={request.user.avatarUrl}
                alt={`Foto de perfil de ${request.user.name}`}
                width={48}
                height={48}
                className="rounded-full border-4 border-white"
              />
              <h4 className="text-lg font-semibold text-gray-800">
                {request.user.name}
              </h4>

              <div className="flex-1 flex flex-row justify-end gap-2">
                {kind === "received" && (
                  <button
                    type="button"
                    className="rounded-full p-2 text-gray-800 hover:bg-lime-100 hover:text-lime-700 transition-colors duration-300 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddFriend(request.user);
                    }}
                  >
                    <Check />
                  </button>
                )}

                <button
                  type="button"
                  className="rounded-full p-2 text-gray-800 hover:bg-red-100 hover:text-red-700 transition-colors duration-300 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFriend(request.user);
                  }}
                >
                  <X />
                </button>
              </div>
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

      {!hasNextPage &&
        (data.pages.length === 0 || data.pages[0].requests.length === 0) && (
          <div className="flex flex-1 justify-center items-center py-4 text-sm text-gray-400 font-medium">
            Nenhum pedido de amizade ainda
          </div>
        )}
    </div>
  );
}

export default function RequestsList({ kind }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-row items-center justify-between mb-4">
        <p className="text-xl text-zinc-900">
          Pedidos de amizade{" "}
          <span className="font-semibold">
            {kind === "sent" ? "enviados" : "recebidos"}
          </span>
        </p>
      </div>

      <div className="flex h-80">
        <RequestsListContent kind={kind} />
      </div>
    </div>
  );
}
