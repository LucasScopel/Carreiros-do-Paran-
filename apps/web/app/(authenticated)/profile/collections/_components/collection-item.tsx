import { Pencil, Pin, Trash } from "lucide-react";
import { MouseEventHandler } from "react";
import { VisibilityLevel } from "shared/types";

interface Props {
  onEdit: MouseEventHandler<HTMLButtonElement>;
  onDelete: MouseEventHandler<HTMLButtonElement>;
  onOpen: MouseEventHandler<HTMLDivElement>;
  collection: {
    publicId: string;
    name: string;
    isDefault: boolean;
    visibility: VisibilityLevel;
    trailCount: number;
  };
}

export default function CollectionItem({
  onEdit,
  onDelete,
  onOpen,
  collection,
}: Props) {
  return (
    <div
      key={collection.publicId}
      className="
        flex items-center justify-between
        rounded-lg border border-zinc-300
        hover:bg-gray-100
        cursor-pointer transition-colors
      "
      onClick={onOpen}
    >
      <div className="inline-flex flex-row items-center gap-3 p-4">
        {collection.isDefault && (
          <Pin size={16} className="translate-y-[1px]" />
        )}

        <h3 className="text-md text-zinc-900 font-semibold">
          {collection.name}
        </h3>
      </div>

      <div className="inline-flex h-full flex-row px-4 items-center text-sm text-neutral-500 whitespace-nowrap">
        {collection.trailCount} trilha
        {collection.trailCount !== 1 && "s"}
        <div className="h-full w-[1px] bg-zinc-200 mx-4" />
        <button
          type="button"
          title="Editar"
          onClick={onEdit}
          className="aspect-square px-2 rounded-full text-zinc-600 hover:bg-zinc-300 transition-colors duration-300 cursor-pointer"
        >
          <Pencil />
        </button>
        {!collection.isDefault && (
          <button
            type="button"
            title="Deletar"
            onClick={onDelete}
            className="aspect-square ml-4 px-2 rounded-full text-red-600 hover:bg-red-200 transition-colors duration-300 cursor-pointer"
          >
            <Trash />
          </button>
        )}
      </div>
    </div>
  );
}
