"use client";

import { useState } from "react";

interface EditTrailProps {
  initial: string | null;
}

export default function EditTrailForm({ initial }: EditTrailProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    coordinates: "",
    length: "",
    duration: "",
  });

  return (
    <div className="flex w-full min-h-full justify-center px-6 py-15 bg-slate-50">
      <div className="flex flex-col w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-zinc-900">
            {initial ? "Editar trilha" : "Nova trilha"}
          </h1>
        </div>

        <div
          className="
            flex flex-col flex-1
            rounded-2xl border border-zinc-200
            bg-white
            p-8 gap-5
          "
        >
          {initial}
        </div>
      </div>
    </div>
  );
}
