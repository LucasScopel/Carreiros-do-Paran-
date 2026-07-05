"use client";

import {
  ListSuggestions,
  SuggestionStatus,
  TrailSuggestion,
} from "shared/types";
import { STATUS_CLASSES, STATUS_LABEL } from "../status";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { queryClient } from "@/lib/query";
import { InfiniteData } from "@tanstack/react-query";

interface SuggestedTrailsDetailProps {
  selectedSuggestion: TrailSuggestion | null;
  onDelete: () => void;
}

export default function SuggestedTrailsDetail({
  selectedSuggestion,
}: SuggestedTrailsDetailProps) {
  const [notes, setNotes] = useState(selectedSuggestion?.adminNotes ?? "");
  const [status, setStatus] = useState(selectedSuggestion?.status ?? "PENDING");
  const hasChanges = useRef(false);

  useEffect(() => {
    hasChanges.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(selectedSuggestion?.adminNotes ?? "");
    setStatus(selectedSuggestion?.status ?? "PENDING");
  }, [selectedSuggestion]);

  useEffect(() => {
    if (!hasChanges.current || !selectedSuggestion) {
      return;
    }

    const toastId = "suggestion-notes-changes-toast";

    toast.loading("Alterações detectadas, salvando...", {
      id: toastId,
    });

    const timer = setTimeout(async () => {
      const result = await api.trails.suggestions.update(
        selectedSuggestion.publicId,
        { notes },
      );

      if (result.ok) {
        toast.success("Notas salvas com sucesso!", {
          id: toastId,
        });
        hasChanges.current = false;
      } else {
        toast.error("Não foi possível salvar as notas.", {
          id: toastId,
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [notes, selectedSuggestion]);

  function handleChangeNotes(text: string) {
    setNotes(text);
    hasChanges.current = true;
  }

  async function handleSetStatus(newStatus: SuggestionStatus) {
    if (!selectedSuggestion) return;
    if (newStatus === status) return;

    const result = await api.trails.suggestions.update(
      selectedSuggestion?.publicId,
      {
        status: newStatus,
      },
    );

    if (result.ok) {
      toast.success("Status salvo com sucesso!");

      setStatus(newStatus);

      queryClient.invalidateQueries({
        queryKey: ["admin", "suggestions", newStatus],
      });

      queryClient.setQueryData(
        ["admin", "suggestions", status],
        (oldData: InfiniteData<ListSuggestions>) => {
          if (!oldData) return undefined;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              return {
                ...page,
                suggestions: page.suggestions.filter(
                  (suggestion) =>
                    suggestion.publicId !== selectedSuggestion.publicId,
                ),
              };
            }),
          };
        },
      );
    } else {
      toast.error("Não foi possível salvar.");
    }
  }

  async function handleDelete() {
    if (!selectedSuggestion) return;

    const result = await api.trails.suggestions.remove(
      selectedSuggestion?.publicId,
    );

    if (result.ok) {
      toast.success("Removido com sucesso!");

      queryClient.setQueryData(
        ["admin", "suggestions", status],
        (oldData: InfiniteData<ListSuggestions>) => {
          if (!oldData) return undefined;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              return {
                ...page,
                suggestions: page.suggestions.filter(
                  (suggestion) =>
                    suggestion.publicId !== selectedSuggestion.publicId,
                ),
              };
            }),
          };
        },
      );
    } else {
      toast.error("Não foi possível remover a sugestão.");
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      {selectedSuggestion ? (
        <>
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedSuggestion.name}
            </h2>
            <p className="text-sm text-slate-700 mt-2">
              {selectedSuggestion.location}
            </p>
            <div
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
            >
              {STATUS_LABEL[status]}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Descrição
              </h3>
              <p className="text-sm leading-6 text-slate-700">
                {selectedSuggestion.details}
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSetStatus("TODO")}
                className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
              >
                Marcar como a fazer
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus("IN_PROGRESS")}
                className="rounded-md border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-100 cursor-pointer"
              >
                Marcar como em andamento
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus("COMPLETED")}
                className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 cursor-pointer"
              >
                Marcar como concluída
              </button>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100 cursor-pointer"
            >
              Excluir sugestão
            </button>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white pt-5">
            <h3 className="text-sm font-semibold text-slate-900 mx-5 mb-2">
              Notas
            </h3>
            <textarea
              value={notes}
              onChange={(e) => handleChangeNotes(e.target.value)}
              className="flex-1 p-3 m-2 resize-none border-2 rounded-md border-gray-400 text-sm text-zinc-900 bg-gray-100 focus:border-[#D99C6A] focus:outline-none hover:border-[#D99C6A]"
            />
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
          Selecione uma sugestão para ler seus detalhes.
        </div>
      )}
    </div>
  );
}
