import { ChangeEvent } from "react";

interface TextInputProps {
  type?: "text" | "password" | "date" | "email" | "number";
  name: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  label: string;
}

export default function TextInput({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required = false,
  label,
}: TextInputProps) {
  return (
    <label className="inline-flex flex-1 flex-col">
      {label}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="
          px-4 py-2
          border-2 rounded-md border-[#424242]
          text-black bg-zinc-100
          focus:border-[#D99C6A] focus:outline-none
          hover:border-[#D99C6A]
          transition-colors duration-300
        "
      />
    </label>
  );
}
