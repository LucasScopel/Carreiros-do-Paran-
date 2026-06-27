import { MouseEventHandler } from "react";
import { GetUserCollections } from "shared/types";

interface Props {
  onOpen: MouseEventHandler<HTMLDivElement>;
  collection: GetUserCollections[0];
}

export default function CollectionItem({ onOpen, collection }: Props) {
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
        <h3 className="text-md text-zinc-900 font-semibold">
          {collection.name}
        </h3>
      </div>

      <div className="inline-flex h-full flex-row px-4 items-center text-sm text-neutral-500 whitespace-nowrap">
        {collection.trailCount} trilha
        {collection.trailCount !== 1 && "s"}
      </div>
    </div>
  );
}
