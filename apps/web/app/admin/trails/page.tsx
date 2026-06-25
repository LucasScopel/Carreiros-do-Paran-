"use client";

import { api } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import TrailDeleteConfirmation from "./_components/trail-delete-confirmation";
import { TrailItemResponse } from "shared/types";
import { toast } from "sonner";
import { queryClient } from "@/lib/query";
import TrailList from "./_components/trail-list";

export default function TrailsPage() {
  const [search, setSearch] = useState("");
  const [trailToDelete, setTrailToDelete] = useState<TrailItemResponse | null>(
    null,
  );

  const trailsQuery = useQuery({
    queryKey: ["admin-trails"],
    queryFn: async () => {
      const result = await api.trails.getAll();
      if (!result.ok) return null;
      return result.data;
    },
  });

  const trails = trailsQuery.data ?? null;
  const isLoading = trailsQuery.isLoading;

  const filteredTrails = useMemo(() => {
    if (!trails) return null;

    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return trails;

    return trails.filter((trail) =>
      trail.name.toLowerCase().includes(normalizedSearch),
    );
  }, [search, trails]);

  async function handleDelete() {
    if (!trailToDelete) return;

    const result = await api.trails.remove(trailToDelete.publicId);

    if (result.ok) {
      toast.success("Trilha removida com sucesso!");

      queryClient.setQueryData<TrailItemResponse[] | null>(
        ["admin-trails"],
        (old) => {
          if (!old) return old;

          return old.filter(
            (trail) => trail.publicId !== trailToDelete.publicId,
          );
        },
      );

      setTrailToDelete(null);
    } else {
      toast.error("Não foi possível excluir a trilha.");
    }
  }

  return (
    <>
      <div className="flex w-full min-h-full justify-center px-6 py-15 bg-slate-50">
        <div className="flex flex-col w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-zinc-900">Trilhas</h1>

            <p className="mt-1 text-md text-zinc-500">
              Visualize, edite e organize as trilhas cadastradas.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row mb-10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar trilha..."
              className="
                flex-1 rounded-md border-2 px-3 py-2
                text-zinc-900 border-zinc-400 outline-none
                focus:border-[#D99C6A]
              "
            />
            <Link
              href="/admin/trails/new"
              className="
                inline-flex items-center
                gap-3 px-3 py-2
                rounded-md
                font-semibold text-md text-white
                bg-[#D99C6A] hover:bg-[#c46518]
                transition-all duration-300
                cursor-pointer
              "
            >
              <Plus />
              Nova trilha
            </Link>
          </div>

          <TrailList
            trails={filteredTrails}
            isLoading={isLoading}
            onDelete={setTrailToDelete}
          />
        </div>
      </div>
      <TrailDeleteConfirmation
        trailName={trailToDelete?.name ?? null}
        onCancel={() => setTrailToDelete(null)}
        onDelete={handleDelete}
      />
    </>
  );
}
