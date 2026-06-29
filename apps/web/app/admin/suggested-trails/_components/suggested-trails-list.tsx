"use client";

import { api } from "@/lib/api/client";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import {
  ListSuggestions,
  SuggestionStatus,
  TrailSuggestion,
} from "shared/types";
import { STATUS_CLASSES, STATUS_LABEL } from "../status";
import LoadingIndicator from "@/app/components/loading-indicator";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, CircleAlert } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface SuggestedTrailsListProps {
  selectedSuggestionId: string | undefined;
  onSelectSuggestion: (suggestion: TrailSuggestion) => void;
}

export default function SuggestedTrailsList({
  selectedSuggestionId,
  onSelectSuggestion,
}: SuggestedTrailsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [statusFilter, setStatusFilter] = useState<SuggestionStatus>(
    (searchParams.get("status") as SuggestionStatus) || "PENDING",
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLButtonElement>(null);

  const {
    data,
    error,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<
    ListSuggestions,
    Error,
    InfiniteData<ListSuggestions>,
    readonly unknown[],
    number | null
  >({
    queryKey: ["admin", "suggestions", statusFilter],

    queryFn: async ({ pageParam }) => {
      const result = await api.trails.suggestions.list({
        status: statusFilter,
        cursor: pageParam ?? undefined,
        limit: 4,
      });

      if (!result.ok) throw result.error;
      return result.data;
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const isEmpty =
    !data || data.pages.length === 0 || data.pages[0].suggestions.length === 0;

  const scrollAreaRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (filterOpen) {
      window.addEventListener("click", (e) => {
        if (
          filterDropdownRef.current &&
          !filterDropdownRef.current.contains(e.target as Node)
        ) {
          setFilterOpen(false);
        }
      });
    }
  }, [filterOpen]);

  function handleFilterChange(status: SuggestionStatus) {
    setStatusFilter(status);

    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      <div className="flex-shrink-0 rounded-md bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-[#263327]">
          Sugestões de Trilhas
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Visualize todas as sugestões enviadas pelos usuários, adicione notas e
          marque o status de cada uma.
        </p>
      </div>

      <div className="relative flex flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <div className="flex flex-row items-center w-full h-20 absolute left-0 top-0 px-6 text-lg bg-white shadow-md">
          <span className="font-semibold">Filtrar por status</span>
          <button
            type="button"
            ref={filterDropdownRef}
            onClick={() => setFilterOpen((curr) => !curr)}
            className={`
              relative group inline-flex flex-row items-center
              gap-2 rounded-full border ml-3 px-3 py-1
              text-sm font-semibold translate-y-[1px]
              transition-all duration-300 cursor-pointer
              ${STATUS_CLASSES[statusFilter]}
            `}
          >
            {STATUS_LABEL[statusFilter]}

            <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-full pointer-events-none"></span>

            <ChevronDown
              size={20}
              className={`transition-transform ${filterOpen ? "-rotate-180" : "translate-y-[1px]"}`}
            />

            {filterOpen && (
              <div
                className="
                  flex flex-col items-stretch
                  absolute -left-10 top-11 w-48
                  bg-white rounded-md border-1 border-zinc-300
                  shadow-md text-slate-800
                "
              >
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <div
                    key={k}
                    onClick={() => handleFilterChange(k as SuggestionStatus)}
                    className={`
                      p-4 gap-3 flex-1 inline-flex flex-row items-center text-sm cursor-pointer hover:bg-gray-200 transition-colors duration-300
                      ${statusFilter === k ? "font-semibold" : ""}
                    `}
                  >
                    <Check className={statusFilter !== k ? "opacity-0" : ""} />
                    {v}
                  </div>
                ))}
              </div>
            )}
          </button>
        </div>

        <div
          ref={scrollAreaRef}
          onScroll={handleScroll}
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 mt-20"
        >
          {status === "success" &&
            (isEmpty ? (
              <div className="text-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
                Nenhuma sugestão com esse status.
              </div>
            ) : (
              data.pages.flatMap((page) =>
                page.suggestions.map((suggestion) => {
                  const selected = suggestion.publicId === selectedSuggestionId;
                  return (
                    <div
                      key={suggestion.publicId}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectSuggestion(suggestion)}
                      onKeyDown={(e) => {
                        // Permite selecionar usando a tecla Enter para acessibilidade
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectSuggestion(suggestion);
                        }
                      }}
                      className={`w-full rounded-xl border px-4 py-4 text-left transition cursor-pointer ${
                        selected
                          ? "border-[#D99C6A] bg-[#fff7ed]"
                          : "border-slate-200 bg-white hover:border-[#D99C6A]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900 line-clamp-1">
                            {suggestion.name}
                          </h2>
                          <p className="text-sm text-slate-600 line-clamp-1">
                            {suggestion.location}
                          </p>
                        </div>
                        <div className="flex-1 flex flex-row justify-end items-center gap-2">
                          <Image
                            unoptimized
                            src={suggestion.user.avatarUrl}
                            alt={`Foto de perfil de ${suggestion.user.name}`}
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                          <p className="text-md font-semibold text-slate-600 line-clamp-1">
                            {suggestion.user.name}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[suggestion.status]}`}
                        >
                          {STATUS_LABEL[suggestion.status]}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500 line-clamp-2">
                        {suggestion.details}
                      </p>
                    </div>
                  );
                }),
              )
            ))}

          {isLoading && (
            <div className="inline-flex flex-row justify-center items-center gap-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
              <LoadingIndicator className="size-5" />
              Carregando...
            </div>
          )}

          {error && (
            <div className="inline-flex flex-row justify-center items-center gap-4 rounded-md border border-dashed border-red-300 bg-red-50 p-6 text-red-600">
              <CircleAlert size={20} />
              Erro ao carregar sugestões
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
