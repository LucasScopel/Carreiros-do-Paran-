"use client";

import { GetMyCollections } from "shared/types";
import CollectionItem from "./collection-item";
import LoadingIndicator from "@/app/components/loading-indicator";

interface Props {
  onEdit: (collection: GetMyCollections[0]) => void;
  onDelete: (collection: GetMyCollections[0]) => void;
  onOpen: (collection: GetMyCollections[0]) => void;
  collections: GetMyCollections | null;
  isLoading: boolean;
}

export default function CollectionList({
  onEdit,
  onDelete,
  onOpen,
  collections,
  isLoading,
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
          "Nenhuma coleção ainda"
        ) : (
          "Não foi possível carregar as coleções"
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {collections.map((collection) => (
        <CollectionItem
          key={collection.publicId}
          collection={collection}
          onEdit={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onEdit(collection);
          }}
          onDelete={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onDelete(collection);
          }}
          onOpen={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onOpen(collection);
          }}
        />
      ))}
    </div>
  );
}
