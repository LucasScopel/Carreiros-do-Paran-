"use client";

import { useRef, useState } from "react";
import { MapRef, TrailMap } from "./components/trails-map";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import DoubleRangeSlider from "./components/double-range-slider";
import { useDebounce } from "@/hooks/useDebounce";

export default function Home() {
  const mapRef = useRef<MapRef>(null);

  const [bbox, setBbox] = useState<number[] | null>(null);
  const [ordering, setOrdering] = useState("");
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
    setOrdering(value);
  }

  return (
    <div className="flex w-full min-h-full items-center justify-center bg-cover bg-center">
      <aside className="sticky relative top-0 left-0 z-40 shrink-0 w-96 h-full">
        <h2 className="m-4 text-xl font-semibold">Explorar trilhas</h2>

        <div className="space-y-4 border-b p-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Dificuldade
            </label>

            <select
              onChange={(e) => handleDifficultyChange(Number(e.target.value))}
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
              <option value="highest-rating">Avaliação mais alta</option>
              <option value="lowest-rating">Avaliação mais baixa</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShowMyLocation}
          className="absolute -right-14 bottom-0 w-10 h-10 p-2 bg-white text-black rounded-full m-2 cursor-pointer group hover:bg-gray-300 transition-colors duration-300"
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
      </aside>

      <TrailMap
        ref={mapRef}
        filters={debouncedFilters}
        setBbox={(bounds) =>
          setBbox([
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth(),
          ])
        }
      />
    </div>
  );
}
