"use client";

import { useEffect, useState } from "react";
import {
  SuggestionStatus,
  TrailSuggestion,
  SUGGESTED_TRAILS_STORAGE_KEY,
} from "@/app/suggest-trails/types";

function getStatusLabel(status: SuggestionStatus) {
  if (status === "a fazer") return "A Fazer";
  if (status === "em andamento") return "Em Andamento";
  return "Novo";
}

function getStatusClass(status: SuggestionStatus) {
  if (status === "a fazer") return "bg-amber-100 text-amber-900 border-amber-200";
  if (status === "em andamento") return "bg-emerald-100 text-emerald-900 border-emerald-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function SuggestTrailsAdmin() {
  const [suggestions, setSuggestions] = useState<TrailSuggestion[]>([]);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(SUGGESTED_TRAILS_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored) as TrailSuggestion[];
      setSuggestions(parsed);
      if (parsed.length > 0) setSelectedSuggestionId(parsed[0].id);
    } catch {
      // ignore invalid storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SUGGESTED_TRAILS_STORAGE_KEY, JSON.stringify(suggestions));
  }, [suggestions]);

  const selectedSuggestion = suggestions.find((suggestion) => suggestion.id === selectedSuggestionId) ?? suggestions[0] ?? null;

  const setStatus = (suggestionId: string, status: SuggestionStatus) => {
    setSuggestions((previous) =>
      previous.map((suggestion) =>
        suggestion.id === suggestionId ? { ...suggestion, status } : suggestion,
      ),
    );
  };

  const deleteSuggestion = (suggestionId: string) => {
    setSuggestions((previous) => {
      const filtered = previous.filter((suggestion) => suggestion.id !== suggestionId);
      if (selectedSuggestionId === suggestionId) {
        setSelectedSuggestionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4">
        <div className="rounded-md bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-[#263327]">Sugestões de Trilhas</h1>
          <p className="mt-2 text-sm text-slate-600">
            Visualize todas as sugestões enviadas pelos usuários e marque o status de cada uma.
          </p>
        </div>

        {suggestions.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
            Nenhuma sugestão enviada ainda.
          </div>
        ) : (
          suggestions.map((suggestion) => {
            const selected = suggestion.id === selectedSuggestion?.id;
            return (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => setSelectedSuggestionId(suggestion.id)}
                className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                  selected ? "border-[#D99C6A] bg-[#fff7ed]" : "border-slate-200 bg-white hover:border-[#D99C6A]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{suggestion.name}</h2>
                    <p className="text-sm text-slate-600">{suggestion.location}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(suggestion.status)}`}>
                    {getStatusLabel(suggestion.status)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  {suggestion.description.slice(0, 100)}{suggestion.description.length > 100 ? "…" : ""}
                </p>
              </button>
            );
          })
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        {selectedSuggestion ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedSuggestion.name}</h2>
              <p className="text-sm text-slate-700 mt-2">{selectedSuggestion.location}</p>
              <div className="mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100">
                {getStatusLabel(selectedSuggestion.status)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Descrição</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedSuggestion.description}</p>
            </div>

            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStatus(selectedSuggestion.id, "a fazer")}
                  className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                >
                  Marcar como a fazer
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(selectedSuggestion.id, "em andamento")}
                  className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                >
                  Marcar como em andamento
                </button>
              </div>
              <button
                type="button"
                onClick={() => deleteSuggestion(selectedSuggestion.id)}
                className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100"
              >
                Excluir sugestão
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
            Selecione uma sugestão para ler seus detalhes.
          </div>
        )}
      </div>
    </div>
  );
}
