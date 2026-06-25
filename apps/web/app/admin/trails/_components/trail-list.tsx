import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { TrailItemResponse } from "shared/types";

interface TrailItemProps {
  name: string;
  publicId: string;
  onDelete: () => void;
}

function TrailItem({ name, publicId, onDelete }: TrailItemProps) {
  return (
    <div
      className="
        flex flex-row items-center
        p-4 gap-4
        bg-white rounded-lg border border-zinc-200
      "
    >
      <p className="flex-1 font-semibold text-xl text-zinc-900">{name}</p>
      <button
        onClick={onDelete}
        className="
          inline-flex
          gap-3 px-3 py-2
          rounded-md
          text-md text-red-600
          hover:bg-red-200
          transition-all duration-300
          cursor-pointer
        "
      >
        <Trash />
        Excluir
      </button>
      <Link
        href={`/admin/trails/${publicId}`}
        className="
          inline-flex
          gap-3 px-3 py-2
          rounded-md
          text-md text-zinc-900
          hover:bg-gray-200
          transition-all duration-300
          cursor-pointer
        "
      >
        <Pencil />
        Editar
      </Link>
    </div>
  );
}

interface TrailListProps {
  trails: TrailItemResponse[] | null;
  isLoading: boolean;
  onDelete: (trail: TrailItemResponse) => void;
}

export default function TrailList({
  trails,
  isLoading,
  onDelete,
}: TrailListProps) {
  if (!trails || trails.length === 0) {
    return (
      <div
        className="
          flex flex-col flex-1 h-full
          justify-center items-center
          font-semibold text-xl text-zinc-900
        "
      >
        {isLoading ? "Carregando..." : "Nenhuma trilha cadastrada ainda."}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-5">
      {trails.map((trail) => (
        <TrailItem
          key={trail.publicId}
          name={trail.name}
          publicId={trail.publicId}
          onDelete={() => onDelete(trail)}
        />
      ))}
    </div>
  );
}
