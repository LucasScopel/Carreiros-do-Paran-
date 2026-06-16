import React from "react";

//Cria o props para receber o outros elementos gráficos (children) e o onSubmit (onSubmit)
interface MenuWhiteboardProps {
  children?: React.ReactNode;
  onSubmit?: (e: React.SubmitEvent<HTMLFormElement>) => void;
}

export default function MenuWhiteboard({
  children,
  onSubmit,
}: MenuWhiteboardProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-125 h-140 px-6 py-6 bg-white rounded-md flex flex-col"
    >
      {children}
    </form>
  );
}
