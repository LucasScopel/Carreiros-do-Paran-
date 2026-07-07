import { Bookmark } from "lucide-react";

interface SaveIconProps {
  saved?: boolean;
  onToggle?: () => void;
  asChild?: boolean; // Propriedade para indicar se ele é apenas o ícone visual
}

export default function SaveIcon({
  saved,
  onToggle,
  asChild = false,
}: SaveIconProps) {
  // Renderiza apenas o ícone puro se for um filho de outro botão
  if (asChild) {
    return (
      <Bookmark
        size={32}
        className={`text-green-600 transition-colors ${saved ? "text-white fill-white" : "fill-transparent"}`}
      />
    );
  }

  // Comportamento como botão independente
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center p-0 m-0 border-none bg-transparent cursor-pointer"
    >
      <Bookmark
        size={32}
        className={`text-green-600 transition-colors ${saved ? "text-white fill-white" : "fill-transparent"}`}
      />
    </button>
  );
}
