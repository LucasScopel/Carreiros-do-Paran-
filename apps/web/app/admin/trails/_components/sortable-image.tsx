"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { FormImage } from "./types";
import { GripVertical, Star, Trash } from "lucide-react";
import { memo } from "react";

type Props = {
  index: number;
  image: FormImage;
  onRemove: () => void;
};

export function getImageKey(image: FormImage) {
  if (image.kind === "existing") {
    return `existing-${image.image.id}`;
  }

  return image.image.key;
}

export const SortableImage = memo(function SortableImage({
  index,
  image,
  onRemove,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: getImageKey(image),
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const title =
    image.kind === "existing"
      ? `Imagem ${image.image.id}`
      : image.image.file.name;

  const src =
    image.kind === "existing" ? image.image.url : image.image.previewUrl;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
        flex flex-col gap-2 p-2 relative
        bg-white rounded border border-zinc-500
      "
    >
      <div
        className="
          relative flex items-center w-full
          rounded-lg overflow-hidden
          aspect-square
          bg-zinc-200
        "
      >
        <Image
          unoptimized
          alt={title}
          title={title}
          fill
          src={src}
          className="object-contain"
        />
      </div>

      {index === 0 && (
        <div className="group absolute top-2 left-2">
          <div
            className="
              flex items-center justify-center
              p-2 rounded-full
              text-white cursor-pointer
            "
          >
            <Star className="stroke-yellow-500 fill-yellow-500" />
          </div>

          <div
            className="
            absolute left-10 top-1/2
            -translate-y-1/2

            whitespace-nowrap
            rounded-md
            bg-black/70
            px-2 py-1

            text-sm text-white

            opacity-0
            pointer-events-none
            transition-all
            translate-x-[-4px]

            group-hover:opacity-100
            group-hover:translate-x-0
          "
          >
            Capa da trilha
          </div>
        </div>
      )}

      <div className="flex flex-row justify-between gap-2">
        <button
          {...attributes}
          {...listeners}
          type="button"
          title="Mover imagem"
          className="
            rounded-full p-2
            text-zinc-900 bg-transparent
            hover:bg-zinc-300
            transition-colors duration-300
            cursor-grab
          "
        >
          <GripVertical />
        </button>

        <button
          type="button"
          onClick={onRemove}
          title="Remover imagem"
          className="
            rounded-full p-2
            text-zinc-900 bg-transparent
            hover:text-red-700 hover:bg-red-100
            transition-colors duration-300
            cursor-pointer
          "
        >
          <Trash />
        </button>
      </div>
    </div>
  );
});
