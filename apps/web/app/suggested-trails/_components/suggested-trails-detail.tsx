"use client";

import { TrailSuggestion, SuggestionStatus } from "../types";

interface SuggestedTrailsDetailProps {
  selectedSuggestion: TrailSuggestion | null;
  onSetStatus: (suggestionId: string, status: SuggestionStatus) => void;
  onDeleteSuggestion: (suggestionId: string) => void;
}

function getStatusLabel(status: SuggestionStatus) {
  if (status === "a fazer") return "A Fazer";
  if (status === "em andamento") return "Em Andamento";
  return "Novo";
}

export default function SuggestedTrailsDetail({
  selectedSuggestion,
  onSetStatus,
  onDeleteSuggestion,
}: SuggestedTrailsDetailProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      {selectedSuggestion ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedSuggestion.name}
            </h2>
            <p className="text-sm text-slate-700 mt-2">
              {selectedSuggestion.location}
            </p>
            <div className="mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100">
              {getStatusLabel(selectedSuggestion.status)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Descrição</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {selectedSuggestion.description}
            </p>
          </div>

          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSetStatus(selectedSuggestion.id, "a fazer")}
                className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
              >
                Marcar como a fazer
              </button>
              <button
                type="button"
                onClick={() =>
                  onSetStatus(selectedSuggestion.id, "em andamento")
                }
                className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
              >
                Marcar como em andamento
              </button>
            </div>
            <button
              type="button"
              onClick={() => onDeleteSuggestion(selectedSuggestion.id)}
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
  );
}
