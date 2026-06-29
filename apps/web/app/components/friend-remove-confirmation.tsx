export default function FriendRemoveConfirmation({
  friendName,
  onCancel,
  onRemove,
}: {
  friendName?: string;
  onCancel: () => void;
  onRemove: () => void;
}) {
  if (!friendName) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
      "
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="text-xl font-semibold">Desfazer amizade</h2>

        <p className="mt-4">Tem certeza que deseja desfazer amizade com</p>

        <div className="mt-4 rounded-md border p-3 font-medium text-center">
          {friendName}
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
            onClick={onRemove}
            className="
              rounded-md
              px-4 py-2
              bg-[#D99C6A] hover:bg-[#c46518]
              font-semibold text-md text-white
              transition-all duration-300
              cursor-pointer
            "
          >
            Desfazer
          </button>
        </div>
      </div>
    </div>
  );
}
