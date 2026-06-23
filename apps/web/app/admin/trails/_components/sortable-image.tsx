"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { FormImage } from "./types";
import { GripVertical, Trash } from "lucide-react";
import { memo } from "react";

type Props = {
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
        flex flex-col gap-2 p-2
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
