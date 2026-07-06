import { SuggestionStatus } from "shared/types";

export const STATUS_LABEL: Record<SuggestionStatus, string> = {
  PENDING: "Pendente",
  TODO: "A Fazer",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluída",
} as const;

export const STATUS_CLASSES: Record<SuggestionStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  TODO: "bg-amber-100 text-amber-900 border-amber-200",
  IN_PROGRESS: "bg-indigo-100 text-indigo-900 border-indigo-200",
  COMPLETED: "bg-emerald-100 text-emerald-900 border-emerald-200",
} as const;
