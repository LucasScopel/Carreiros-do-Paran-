"use client";

import { UIEvent } from "react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { GetUserCollections, GetUserCollectionTrails } from "shared/types";
import { api } from "@/lib/api/client";
import { X } from "lucide-react";
import Rating from "@/app/components/rating";
import Link from "next/link";

interface CollectionModalProps {
  userId?: string;
  collection: GetUserCollections[0];
  onClose: () => void;
}

export function CollectionModal({
  userId,
  collection,
  onClose,
}: CollectionModalProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<
      GetUserCollectionTrails,
      Error,
      InfiniteData<GetUserCollectionTrails>,
      readonly unknown[],
      number | null
    >({
      queryKey: userId
        ? ["collection-trails", collection.publicId]
        : ["user", userId, "collection-trails", collection.publicId],

      queryFn: async ({ pageParam }) => {
        let result;

        if (userId) {
          result = await api.users.collections.getUserTrails(
            userId,
            collection.publicId,
            {
              cursor: pageParam ?? undefined,
            },
          );
        } else {
          result = await api.users.collections.getTrails(collection.publicId, {
            cursor: pageParam ?? undefined,
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

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    // Calcula a distância até o final do scroll
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50; // 50px de margem de tolerância

    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl h-1/2 bg-white rounded-2xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden z-10">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <p className="text-xl font-semibold text-zinc-900">
            {collection.name}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X />
          </button>
        </div>

        <div
          className="p-6 overflow-y-auto flex-1 space-y-4"
          onScroll={handleScroll}
        >
          {status === "pending" && (
            <div className="flex justify-center py-8 text-gray-500">
              Carregando itens...
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-8 text-red-500">
              Erro ao carregar itens.
            </div>
          )}

          {status === "success" && (
            <div className="grid grid-cols-1 gap-4">
              {data.pages.flatMap((page) => {
                return page.trails.map((trail) => (
                  <Link
                    key={trail.publicId}
                    href={`/trail-details/${trail.publicId}`}
                    className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h4 className="text-lg font-semibold text-gray-800 mb-5">
                      {trail.name}
                    </h4>

                    <div className="flex flex-row justify-between">
                      <Rating
                        icon="star"
                        label="Avaliação"
                        rating={trail.rating}
                        tooltip="right"
                      />

                      <Rating
                        icon="flame"
                        label="Dificuldade"
                        rating={trail.difficulty}
                        tooltip="left"
                      />
                    </div>
                  </Link>
                ));
              })}
            </div>
          )}

          {status === "success" && hasNextPage && (
            <div className="h-10 flex justify-center items-center mt-4">
              {isFetchingNextPage ? (
                <span className="text-sm text-gray-500 animate-pulse">
                  Carregando mais itens...
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  Role para carregar mais
                </span>
              )}
            </div>
          )}

          {/* Se não houver mais páginas, mostra apenas a mensagem de fim */}
          {status === "success" && !hasNextPage && (
            <div className="text-center py-4 text-sm text-gray-400 font-medium">
              Fim da coleção.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
