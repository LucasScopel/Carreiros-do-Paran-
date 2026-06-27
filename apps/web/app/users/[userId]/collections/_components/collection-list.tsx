"use client";

import { GetUserCollections } from "shared/types";
import CollectionItem from "./collection-item";
import LoadingIndicator from "@/app/components/loading-indicator";

interface Props {
  onOpen: (collection: GetUserCollections[0]) => void;
  isLoading: boolean;
  collections: GetUserCollections | null;
}

export default function CollectionList({
  onOpen,
  isLoading,
  collections,
}: Props) {
  if (collections === null || collections.length === 0) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-xl text-zinc-900">
        {isLoading ? (
          <div className="inline-flex flex-row items-center gap-4">
            <LoadingIndicator className="size-5" />
            Carregando...
          </div>
        ) : collections?.length === 0 ? (
          "Nenhuma coleção pública"
        ) : (
          "Não foi possível carregar as coleções"
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {collections.map((collection) => (
          <CollectionItem
            key={collection.publicId}
            collection={collection}
            onOpen={(e) => {
              e.preventDefault();
              e.stopPropagation();

              onOpen(collection);
            }}
          />
        ))}
      </div>
    </>
  );
}
