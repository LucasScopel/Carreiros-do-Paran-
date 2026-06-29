"use client";

import { api } from "@/lib/api/client";
import { queryClient } from "@/lib/query";
import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { VisibilityLevel } from "shared/types";
import { toast } from "sonner";

interface Props {
  initial?: {
    publicId: string;
    isDefault: boolean;
    name: string;
    visibility: VisibilityLevel;
  };
  onClose: () => void;
}

const VISIBILITY_LEVEL_TO_TEXT = {
  PUBLIC: "Todos",
  FRIENDS: "Meus amigos",
  PRIVATE: "Somente eu",
} as const;

export default function EditCollectionModal({ initial, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [visibility, setVisibility] = useState<VisibilityLevel>(
    initial?.visibility ?? "PRIVATE",
  );

  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [visibilityPickerOpen, setVisibilityPickerOpen] = useState(false);

  useEffect(() => {
    if (visibilityPickerOpen) {
      window.addEventListener("click", (e) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          setVisibilityPickerOpen(false);
        }
      });
    }
  }, [visibilityPickerOpen]);

  async function handleSave() {
    let result;

    if (initial) {
      result = await api.users.collections.update(initial.publicId, {
        ...(initial?.isDefault ? {} : { name: name.trim() }),
        visibility: visibility,
      });
    } else {
      result = await api.users.collections.create({
        name: name.trim(),
        visibility: visibility,
      });
    }

    if (!result.ok) {
      if (result.error.code === "CONFLICT") {
        toast.error("Já existe uma coleção com esse nome.");
      } else if (result.error.code === "VALIDATION_ERROR") {
        toast.error("Esse nome é muito curto ou muito grande.");
      } else {
        toast.error(
          initial
            ? "Não foi possível atualizar a coleção."
            : "Não foi possível criar a coleção.",
        );
      }
    } else {
      toast.success(
        initial
          ? "Coleção atualizada com sucesso!"
          : "Coleção criada com sucesso!",
      );
      onClose();

      queryClient.invalidateQueries({
        queryKey: ["me", "collections"],
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl h-1/2 bg-white rounded-2xl shadow-xl flex flex-col max-h-[80vh] z-10">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <p className="text-xl font-semibold text-zinc-900">Nova coleção</p>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-8 justify-between">
          <label className="inline-flex flex-1 flex-col">
            Nome da coleção
            <input
              type="text"
              name="name"
              placeholder="Nome da coleção"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={initial?.isDefault}
              className="
                px-4 py-2 mb-2
                border-2 rounded-md border-[#424242]
                text-black bg-zinc-100
                focus:border-[#D99C6A] focus:outline-none
                hover:border-[#D99C6A]
                transition-colors duration-300
              "
            />
          </label>

          <div className="inline-flex flex-1 flex-col">
            Quem poderá ver essa coleção?
            <button
              type="button"
              ref={dropdownRef}
              onClick={() => setVisibilityPickerOpen((curr) => !curr)}
              className="
                inline-flex flex-row justify-between
                relative px-4 py-2
                border-2 rounded-md border-[#424242]
                text-md text-zinc-900 bg-zinc-100
                hover:border-[#D99C6A]
                transition-colors duration-300
                cursor-pointer
              "
            >
              {VISIBILITY_LEVEL_TO_TEXT[visibility]}
              <ChevronDown
                className={`translate-y-[1px] transition-transform ${visibilityPickerOpen ? "-rotate-180" : ""}`}
              />

              {visibilityPickerOpen && (
                <div
                  className="
                  flex flex-col items-stretch
                  absolute left-0 top-11 w-full
                  bg-white rounded-md border-1 border-zinc-300
                  shadow-md
                "
                >
                  {Object.entries(VISIBILITY_LEVEL_TO_TEXT).map(([k, v]) => (
                    <div
                      key={k}
                      onClick={() => setVisibility(k as VisibilityLevel)}
                      className={`
                        p-4 gap-3 flex-1 inline-flex flex-row items-center cursor-pointer hover:bg-gray-200 transition-colors duration-300
                        ${visibility === k ? "font-semibold" : ""}
                      `}
                    >
                      <Check className={visibility !== k ? "opacity-0" : ""} />
                      {v}
                    </div>
                  ))}
                </div>
              )}
            </button>
          </div>

          <div className="flex flex-row justify-end gap-5">
            <button
              onClick={onClose}
              className="py-2 rounded-md bg-zinc-200 text-slate-800 w-48 cursor-pointer hover:bg-zinc-300 transition-all duration-300"
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              className="py-2 rounded-md bg-[#D99C6A] text-white font-semibold w-48 cursor-pointer hover:bg-[#c46518] hover:brightness-120 transition-all duration-300"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
