"use client";

import { TrailSuggestion, SuggestionStatus } from "../types";

interface SuggestedTrailsListProps {
  suggestions: TrailSuggestion[];
  selectedSuggestionId: string | null;
  onSelectSuggestion: (id: string) => void;
}

function getStatusLabel(status: SuggestionStatus) {
  if (status === "a fazer") return "A Fazer";
  if (status === "em andamento") return "Em Andamento";
  return "Novo";
}

function getStatusClass(status: SuggestionStatus) {
  if (status === "a fazer")
    return "bg-amber-100 text-amber-900 border-amber-200";
  if (status === "em andamento")
    return "bg-emerald-100 text-emerald-900 border-emerald-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function SuggestedTrailsList({
  suggestions,
  selectedSuggestionId,
  onSelectSuggestion,
}: SuggestedTrailsListProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-[#263327]">
          Sugestões de Trilhas
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Visualize todas as sugestões enviadas pelos usuários e marque o status
          de cada uma.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
          Nenhuma sugestão enviada ainda.
        </div>
      ) : (
        suggestions.map((suggestion) => {
          const selected = suggestion.id === selectedSuggestionId;
          return (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => onSelectSuggestion(suggestion.id)}
              className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                selected
                  ? "border-[#D99C6A] bg-[#fff7ed]"
                  : "border-slate-200 bg-white hover:border-[#D99C6A]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {suggestion.name}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {suggestion.location}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(suggestion.status)}`}
                >
                  {getStatusLabel(suggestion.status)}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {suggestion.description.slice(0, 100)}
                {suggestion.description.length > 100 ? "…" : ""}
              </p>
            </button>
          );
        })
      )}
    </div>
  );
}
