interface EditableDescriptionProps {
  description: string;
  onChange: (name: string) => void;
}

export default function EditableDescription({
  description,
  onChange,
}: EditableDescriptionProps) {
  return (
    <textarea
      value={description}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Descrição do perfil"
      className="
        resize-none
        w-full h-full
        text-md font-normal text-zinc-900
        placeholder:text-zinc-400
        p-3
        rounded-md border border-zinc-300"
    />
  );
}
