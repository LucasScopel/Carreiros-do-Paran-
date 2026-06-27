"use client";

import { GetMyCollections } from "shared/types";

interface Props {
  collection: GetMyCollections[0] | null;
  onCancel: () => void;
  onDelete: () => void;
}

export default function DeleteConfirmation({
  collection,
  onCancel,
  onDelete,
}: Props) {
  if (!collection) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
      "
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="text-xl font-semibold">Excluir coleção</h2>

        <p className="mt-4">Tem certeza que deseja excluir esta coleção?</p>

        <div className="mt-4 rounded-md border p-3 font-medium text-center">
          {collection.name}
        </div>

        <div className="mt-4 text-sm">
          <p className="mt-4 font-medium text-red-600">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="
              rounded-md
              px-4 py-2
              font-semibold text-md text-zinc-500
              hover:text-zinc-700 hover:bg-zinc-200
              transition-all duration-300
              cursor-pointer
            "
          >
            Cancelar
          </button>

          <button
            onClick={onDelete}
            className="
              rounded-md
              px-4 py-2
              bg-[#D99C6A] hover:bg-[#c46518]
              font-semibold text-md text-white
              transition-all duration-300
              cursor-pointer
            "
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
