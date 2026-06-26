"use client";

import { api } from "@/lib/api/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutAll() {
  const router = useRouter();

  async function handleClick() {
    const result = await api.auth.logoutAll();

    if (result.ok) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleClick}
      className="
        inline-flex items-center gap-4
        w-full px-4 py-3
        text-md text-red-600 font-semibold
        rounded-md
        hover:bg-red-200 transition-all duration-300
        cursor-pointer
      "
    >
      <LogOut />
      Encerrar todas as sessões
    </button>
  );
}
