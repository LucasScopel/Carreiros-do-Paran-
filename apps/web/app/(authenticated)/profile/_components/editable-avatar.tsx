"use react";

import { Pencil, Trash } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

interface EditableAvatarProps {
  avatar: string;
  hasCustomAvatar: boolean;
  onChange: (file: File | null) => void;
}

export default function EditableAvatar({
  avatar,
  hasCustomAvatar,
  onChange,
}: EditableAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    onChange(file);
  }

  function handleRemove() {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-start gap-6">
        <button
          onClick={handleAvatarClick}
          className="
          group
          relative
          w-64 h-64
          overflow-hidden
          rounded-full
          cursor-pointer
          self-start
          "
        >
          <Image
            src={avatar}
            alt="Profile picture"
            fill
            unoptimized
            className="
          rounded-full
          object-cover
          border-4
          border-white
          shadow-sm
        "
          />

          <div
            className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          rounded-full
          bg-black/40
          opacity-0
          transition-opacity
          group-hover:opacity-100
        "
          >
            <Pencil className="h-10 w-10 text-white" />
          </div>
        </button>

        {hasCustomAvatar ? (
          <button
            onClick={handleRemove}
            className="
            inline-flex flex-row justify-center gap-3
            w-48
            py-2
            rounded-md
            text-slate-800
            bg-zinc-200 hover:bg-zinc-300
            transition-all duration-300
            cursor-pointer
            "
          >
            <Trash />
            Remover
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
