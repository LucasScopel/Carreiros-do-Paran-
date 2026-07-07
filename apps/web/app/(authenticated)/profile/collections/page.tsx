"use client";

import { api } from "@/lib/api/client";
import CreateCollectionButton from "./_components/create-collection-button";
import CollectionList from "./_components/collection-list";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GetMyCollections, GetUserCollections } from "shared/types";
import DeleteConfirmation from "./_components/delete-confirmation";
import { toast } from "sonner";
import { queryClient } from "@/lib/query";
import { CollectionModal } from "@/app/components/collection-trails-modal";
import AddCollectionModal from "@/app/components/add-collection-modal";

export default function ProfileCollectionsPage() {
  const query = useQuery({
    queryKey: ["me", "collections"],
    queryFn: async () => {
      const result = await api.users.collections.getMine();
      const collections = result.ok ? result.data : null;
      return collections;
    },
  });

  const collections = query.data ? query.data : null;

  const [editingCollection, setEditingCollection] = useState<
    GetMyCollections[0] | null
  >(null);

  const [deletingCollection, setDeletingCollection] = useState<
    GetMyCollections[0] | null
  >(null);

  const [selectedCollection, setSelectedCollection] = useState<
    GetUserCollections[0] | null
  >(null);

  async function handleDelete() {
    if (!deletingCollection) return;

    const result = await api.users.collections.delete(
      deletingCollection.publicId,
    );

    if (result.ok) {
      toast.success("Coleção excluída com sucesso!");

      queryClient.setQueryData<GetMyCollections | null>(
        ["me", "collections"],
        (old) => {
          if (!old) return old;

          return old.filter(
            (trail) => trail.publicId !== deletingCollection.publicId,
          );
        },
      );

      setDeletingCollection(null);
    } else {
      toast.error("Não foi possível excluir a coleção.");
    }
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
      <div className="flex flex-row items-center justify-between">
        <p className="text-xl text-zinc-900">
          Minhas coleções ({collections?.length ?? 0})
        </p>

        <CreateCollectionButton />
      </div>

      <div className="h-[1px] w-full mt-4 mb-8 bg-zinc-300" />

      <CollectionList
        collections={collections}
        onEdit={setEditingCollection}
        onDelete={setDeletingCollection}
        onOpen={setSelectedCollection}
        isLoading={query.isLoading}
      />

      {editingCollection && (
        <AddCollectionModal
          initial={editingCollection}
          onClose={() => setEditingCollection(null)}
        />
      )}

      <DeleteConfirmation
        collection={deletingCollection}
        onCancel={() => setDeletingCollection(null)}
        onDelete={handleDelete}
      />

      {selectedCollection && (
        <CollectionModal
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
        />
      )}
    </div>
  );
}
