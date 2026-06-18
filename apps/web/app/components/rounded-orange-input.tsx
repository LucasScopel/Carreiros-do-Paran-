import React from "react";

interface RoundedGreenInputProps {
  type: "text" | "password" | "date" | "email" | "number";
  name: string;
  placeholder?: string;
  value: string; //Isso é controlado pelo componente que usar
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function RoundedGreenInput({
  type,
  name,
  placeholder,
  value,
  onChange,
  required = false,
}: RoundedGreenInputProps) {
  const isDateEmpty = type === "date" && !value;

  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`px-4 py-2 border-2 rounded-md text-black 
                  border-[#424242] bg-gray-100
                  focus:border-[#D99C6A] focus:outline-none hover:border-[#D99C6A] 
                  transition-colors duration-300
                  ${isDateEmpty ? "text-gray-400" : "text-black"}
                  [&::-webkit-calendar-picker-indicator]:invert-[0.5]
                  [&::-webkit-calendar-picker-indicator]:hidden
                  `}
    />
  );
}
