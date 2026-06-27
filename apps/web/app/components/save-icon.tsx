import { Bookmark } from "lucide-react";
import { use, useState } from "react";

interface SaveIconProps {
  saved?: boolean;
  onToggle?: () => void;
}

export default function SaveIcon({ saved, onToggle }: SaveIconProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center p-0 m-0 border-none bg-transparent"
    >
      <Bookmark
        size={32}
        className={`text-green-600 transition-colors ${saved ? "fill-green-600" : "fill-transparent"}`}
      />
    </button>
  );
}
