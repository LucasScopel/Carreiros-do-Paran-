"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import EditCollectionModal from "./edit-collection-modal";

export default function CreateCollectionButton() {
  const [open, setOpen] = useState(false);

  function handleClick() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="
          inline-flex items-center
          gap-3 px-3 py-2
          rounded-md
          font-semibold text-md text-white
          bg-[#D99C6A] hover:bg-[#c46518]
          transition-all duration-300
          cursor-pointer
        "
      >
        <Plus />
        Nova coleção
      </button>

      {open && <EditCollectionModal onClose={handleClose} />}
    </>
  );
}
