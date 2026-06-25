"use client";

interface TrailDeleteConfirmationProps {
  trailName: string | null;
  onCancel: () => void;
  onDelete: () => void;
}

export default function TrailDeleteConfirmation({
  trailName,
  onCancel,
  onDelete,
}: TrailDeleteConfirmationProps) {
  if (!trailName) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
      "
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="text-xl font-semibold">Excluir trilha</h2>

        <p className="mt-4">Tem certeza que deseja excluir esta trilha?</p>

        <div className="mt-4 rounded-md border p-3 font-medium text-center">
          {trailName}
        </div>

        <div className="mt-4 text-sm">
          <p>Esta ação irá:</p>

          <ul className="mt-2 list-disc pl-5">
            <li>Remover permanentemente a trilha</li>

            <li>Excluir todas as imagens associadas</li>

            <li>Excluir todas as avaliações associadas</li>

            <li>Remover a trilha do mapa</li>
          </ul>

          <p className="mt-4 font-medium text-red-600">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onDelete}
            className="
              rounded-md
              px-4 py-2
              font-semibold text-sm text-zinc-500
              hover:text-white hover:bg-red-500
              transition-all duration-300
              cursor-pointer
            "
          >
            Excluir para sempre
          </button>

          <button
            onClick={onCancel}
            autoFocus
            className="
              rounded-md
              px-4 py-2
              bg-[#D99C6A] hover:bg-[#c46518]
              font-semibold text-md text-white
              transition-all duration-300
              cursor-pointer
            "
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
