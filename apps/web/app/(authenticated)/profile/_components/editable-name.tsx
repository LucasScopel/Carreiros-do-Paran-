import { Pencil } from "lucide-react";

interface EditableNameProps {
  name: string;
  onChange: (name: string) => void;
}

export default function EditableName({ name, onChange }: EditableNameProps) {
  return (
    <div
      className="
        group
        flex
        items-center
        gap-4
      "
    >
      <input
        value={name}
        onChange={(e) => onChange(e.target.value)}
        maxLength={100}
        className="
        field-sizing-content min-w-24 max-w-120
        text-3xl font-semibold text-zinc-900
        p-2
        transition-colors duration-200
        border-b border-transparent
        focus:outline-none focus:border-b focus:border-b-zinc-700
        hover:border-b hover:border-b-zinc-700
      "
      />

      <Pencil
        className="
          h-5 w-5
          text-zinc-400
          opacity-0
          transition-all duration-200
          group-focus-within:opacity-100
          group-focus-within:text-zinc-700
          group-hover:opacity-100
          group-hover:text-zinc-700
        "
      />
    </div>
  );
}
