"use client";

import { GetUserCollections, GetUserResponse } from "shared/types";
import CollectionList from "./collection-list";
import { api } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CollectionModal } from "@/app/components/collection-trails-modal";

export default function UserCollectionsPage({
  user,
}: {
  user: GetUserResponse;
}) {
  const query = useQuery({
    queryKey: ["user", user.publicId, "collections"],
    queryFn: async () => {
      const result = await api.users.collections.getUser(user.publicId);
      const collections = result.ok ? result.data : null;
      return collections;
    },
  });

  const collections = query.data ? query.data : null;

  const [selectedCollection, setSelectedCollection] = useState<
    GetUserCollections[0] | null
  >(null);

  return (
    <>
      <p className="text-xl text-zinc-900">
        Coleções de <span className="font-semibold">{user.name}</span> (
        {collections?.length ?? 0})
      </p>

      <div className="h-[1px] w-full mt-4 mb-8 bg-zinc-300" />

      <CollectionList
        collections={collections}
        isLoading={query.isLoading}
        onOpen={setSelectedCollection}
      />

      {selectedCollection && (
        <CollectionModal
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
          userId={user.publicId}
        />
      )}
    </>
  );
}
