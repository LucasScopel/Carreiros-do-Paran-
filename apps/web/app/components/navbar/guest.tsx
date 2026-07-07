"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GuestMenu() {
  const pathName = usePathname();

  return (
    <>
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(pathName)}`}
        className="
            hover:bg-gray-200
            transition-all duration-300
            px-3 py-2
            rounded-md
            cursor-pointer
            "
      >
        Entrar
      </Link>
      <Link
        href={`/create-account?callbackUrl=${encodeURIComponent(pathName)}`}
        className="
            bg-[#D99C6A] hover:bg-[#c46518]
            transition-all duration-300
            px-3 py-2
            rounded-md
            text-white
            cursor-pointer
            "
      >
        Criar conta
      </Link>
    </>
  );
}
