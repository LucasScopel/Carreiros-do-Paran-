"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapRef, TrailMap } from "./components/trails-map";
import {
  ChevronDown,
  Filter,
  ImageOff,
  LocateFixed,
  MapPin,
  MapPinned,
  MapPinOff,
} from "lucide-react";
import { toast } from "sonner";
import DoubleRangeSlider from "./components/double-range-slider";
import { useDebounce } from "@/hooks/useDebounce";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { TrailSearch } from "shared/types";
import { LngLatBounds } from "maplibre-gl";
import { queryClient } from "@/lib/query";
import Rating from "./components/rating";
import { minutesToText } from "shared/utils";
import Image from "next/image";

export default function Home() {
  const mapRef = useRef<MapRef>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fixMapBounds, setFixMapBounds] = useState(false);
  const fixedBounds = useRef<{ lng: number; lat: number; zoom: number }>(null);

  const [bbox, setBbox] = useState<LngLatBounds | null>(null);
  const debouncedBbox = useDebounce(bbox, 500);

  const [ordering, setOrdering] = useState<"highest-rated" | "lowest-rated">(
    "highest-rated",
  );

  const [filters, setFilters] = useState({
    difficulty: null as number | null,
    minLength: 0,
    maxLength: 30,
    minDuration: 0,
    maxDuration: 300,
  });
  const debouncedFilters = useDebounce(filters, 400);

  function handleShowMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não é suportada pelo seu navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.flyTo(
          position.coords.longitude,
          position.coords.latitude,
        );
      },
      () => toast.error("Não foi possível identificar sua localização"),
    );
  }

  function handleDifficultyChange(value: number) {
    setFilters((prev) => ({
      ...prev,
      difficulty: value === 0 ? null : value,
    }));
  }

  function handleLengthRangeChange({ min, max }: { min: number; max: number }) {
    setFilters((prev) => ({
      ...prev,
      minLength: min,
      maxLength: max,
    }));
  }

  function handleDurationRangeChange({
    min,
    max,
  }: {
    min: number;
    max: number;
  }) {
    setFilters((prev) => ({
      ...prev,
      minDuration: min,
      maxDuration: max,
    }));
  }

  function handleOrderingChange(value: string) {
    setOrdering(value as "highest-rated" | "lowest-rated");
  }

  const {
    data,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isPending,
  } = useInfiniteQuery<
    TrailSearch,
    Error,
    InfiniteData<TrailSearch>,
    readonly unknown[],
    string | null
  >({
    queryKey: ["trails", "list", debouncedFilters, ordering],
    queryFn: async ({ pageParam }) => {
      const result = await api.trails.search({
        bounds: debouncedBbox!.toArray().flatMap((x) => x),
        difficulty: debouncedFilters.difficulty,
        minLength: debouncedFilters.minLength,
        maxLength: debouncedFilters.maxLength,
        minDuration: debouncedFilters.minDuration,
        maxDuration: debouncedFilters.maxDuration,
        cursor: pageParam ?? undefined,
        limit: 5,
        orderBy: ordering,
      });

      if (!result.ok) {
        throw result.error;
      }

      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    enabled: !!debouncedBbox,
  });

  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current || isFetchingNextPage) return;

    const bottom =
      scrollAreaRef.current.scrollHeight - scrollAreaRef.current.scrollTop <=
      scrollAreaRef.current.clientHeight + 50;

    if (bottom && hasNextPage) {
      fetchNextPage();
    }
  }, [scrollAreaRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleBboxChange = useCallback(
    (value: LngLatBounds) => {
      if (fixMapBounds) return;
      setBbox(value);
    },
    [fixMapBounds],
  );

  function handleFixBounds() {
    if (!fixMapBounds && mapRef.current) {
      setBbox(mapRef.current.getBounds());
      fixedBounds.current = mapRef.current.getPanZoom();
    } else {
      fixedBounds.current = null;
    }

    setFixMapBounds(!fixMapBounds);
  }

  function handleBackToFixedBounds() {
    if (fixMapBounds && bbox && mapRef.current && fixedBounds.current) {
      mapRef.current.flyTo(
        fixedBounds.current.lng,
        fixedBounds.current.lat,
        fixedBounds.current.zoom,
      );
    }
  }

  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  useEffect(() => {
    if (fixMapBounds) return;

    queryClient.invalidateQueries({
      queryKey: ["trails", "list"],
    });
  }, [debouncedBbox, fixMapBounds]);

  return (
    <div className="flex w-full min-h-full items-center justify-center bg-cover bg-center">
      <aside className="flex flex-col sticky top-0 left-0 z-40 shrink-0 w-110 h-[calc(100vh-64px)]">
        <h2 className="m-4 text-xl font-semibold">Explorar trilhas</h2>

        <button
          onClick={() => setIsFilterOpen((c) => !c)}
          className="
            inline-flex flex-row items-center m-2 gap-4
            bg-[#D99C6A] hover:bg-[#c46518] cursor-pointer
            text-white font-semibold py-2 px-4 rounded transition-colors
          "
        >
          <Filter />
          {isFilterOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
          <span className="flex-1 flex justify-end">
            <ChevronDown
              className={`transition-transform ${isFilterOpen ? "-rotate-180" : "rotate-0"}`}
            />
          </span>
        </button>
        <div
          className={`grid transition-all duration-300 ease-out-in ${isFilterOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="bg-gray-100 overflow-hidden inset-shadow-sm">
            <div className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Dificuldade
                </label>

                <select
                  onChange={(e) =>
                    handleDifficultyChange(Number(e.target.value))
                  }
                  className="w-full rounded-md border p-2 text-sm"
                >
                  <option value="0">Todas</option>
                  <option value="1">Muito fácil</option>
                  <option value="2">Fácil</option>
                  <option value="3">Média</option>
                  <option value="4">Difícil</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tamanho do trajeto
                </label>

                <DoubleRangeSlider
                  min={0}
                  max={30}
                  suffix="km"
                  onChange={handleLengthRangeChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Duração do trajeto
                </label>

                <DoubleRangeSlider
                  min={0}
                  max={300}
                  step={10}
                  suffix="min"
                  onChange={handleDurationRangeChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Ordenar por
                </label>

                <select
                  onChange={(e) => handleOrderingChange(e.target.value)}
                  className="w-full rounded-md border p-2 text-sm"
                >
                  <option value="highest-rated">Avaliação mais alta</option>
                  <option value="lowest-rated">Avaliação mais baixa</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col absolute -right-14 bottom-0 text-black">
          {fixMapBounds && (
            <button
              type="button"
              onClick={handleBackToFixedBounds}
              className="relative w-10 h-10 rounded-full p-2 m-2 bg-white cursor-pointer group hover:bg-gray-300 transition-colors duration-300"
            >
              <MapPinned />
              <div
                className={`
              absolute top-1/2 -translate-y-1/2
              whitespace-nowrap
              rounded-md px-2 py-1
              text-sm text-white
              bg-black/70 opacity-0
              pointer-events-none transition-all group-hover:opacity-100
              left-0 translate-x-12 group-hover:translate-x-14
            `}
              >
                Voltar à posição travada
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={handleFixBounds}
            className="relative w-10 h-10 rounded-full p-2 m-2 bg-white cursor-pointer group hover:bg-gray-300 transition-colors duration-300"
          >
            {fixMapBounds ? <MapPin /> : <MapPinOff />}
            <div
              className={`
              absolute top-1/2 -translate-y-1/2
              whitespace-nowrap
              rounded-md px-2 py-1
              text-sm text-white
              bg-black/70 opacity-0
              pointer-events-none transition-all group-hover:opacity-100
              left-0 translate-x-12 group-hover:translate-x-14
            `}
            >
              {fixMapBounds ? "Destravar" : "Travar"} pesquisa na visão do mapa
            </div>
          </button>

          <button
            type="button"
            onClick={handleShowMyLocation}
            className="relative w-10 h-10 rounded-full p-2 m-2 bg-white cursor-pointer group hover:bg-gray-300 transition-colors duration-300"
          >
            <LocateFixed />
            <div
              className={`
              absolute top-1/2 -translate-y-1/2
              whitespace-nowrap
              rounded-md px-2 py-1
              text-sm text-white
              bg-black/70 opacity-0
              pointer-events-none transition-all group-hover:opacity-100
              left-0 translate-x-12 group-hover:translate-x-14
            `}
            >
              Mostrar minha localização
            </div>
          </button>
        </div>

        <div className="h-1.5 w-full bg-slate-200 overflow-hidden">
          {(isFetching || isPending) && (
            <div className="animate-progress w-full h-full bg-slate-400 origin-left-right" />
          )}
        </div>

        <div
          ref={scrollAreaRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto"
        >
          {status === "success" &&
            (data.pages.length === 0 || data.pages[0].trails.length === 0 ? (
              <div className="font-semibold flex h-full justify-center items-center text-zinc-600">
                Nenhum resultado
              </div>
            ) : (
              data.pages.flatMap((page) =>
                page.trails.map((trail) => (
                  <button
                    key={trail.publicId}
                    type="button"
                    onClick={() => {}}
                    className="flex flex-col w-full border-b border-zinc-200 p-4 text-left transition-colors bg-white hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="relative flex justify-center items-center aspect-[2.8125] w-full h-full rounded-lg overflow-hidden bg-zinc-200">
                      {trail.imageUrl ? (
                        <Image
                          unoptimized
                          src={trail.imageUrl}
                          alt={trail.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ImageOff className="text-zinc-500" />
                      )}
                    </div>

                    <span className="font-semibold text-lg my-2">
                      {trail.name}
                    </span>

                    <div className="flex flex-row justify-between">
                      <Rating
                        icon="star"
                        tooltip="right"
                        rating={trail.rating}
                      />
                      <Rating
                        icon="flame"
                        tooltip="left"
                        rating={trail.difficulty}
                      />
                    </div>

                    <div className="grid grid-cols-2 items-center text-sm mt-3">
                      <span className="font-semibold">Duração</span>
                      <span>{minutesToText(trail.duration)}</span>
                      <span className="font-semibold">Tamanho</span>
                      <span>
                        {trail.length.toFixed(1).replace(".", ",")} km
                      </span>
                    </div>
                  </button>
                )),
              )
            ))}

          {status === "error" && (
            <div className="font-semibold flex h-full justify-center items-center text-red-600">
              Algo deu errado
            </div>
          )}
        </div>
      </aside>

      <TrailMap
        ref={mapRef}
        filters={debouncedFilters}
        setBbox={handleBboxChange}
      />
    </div>
  );
}
