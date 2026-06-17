"use client";

import { api } from "@/lib/api/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MeResponse } from "shared/types";

interface UserMenuProps {
  user: MeResponse;
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  function handleMenuClick() {
    setOpen((curr) => !curr);
  }

  function handleGoToProfile() {
    setOpen(false);
    router.push("/profile");
  }

  async function handleLogout() {
    await api.auth.logout();

    setOpen(false);

    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleMenuClick}
        className="
          font-semibold text-black
          inline-flex items-center gap-3
          cursor-pointer
          "
      >
        {user.name}
        <Image
          src={user.avatarUrl}
          alt="avatar"
          width={40}
          height={40}
          className="rounded-full"
          unoptimized
        />
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-12
            z-50 w-80
            overflow-hidden
            rounded-lg border
            bg-white
            shadow-lg
          "
        >
          <div className="flex items-center gap-3 p-4">
            <Image
              src={user.avatarUrl}
              alt="avatar"
              width={56}
              height={56}
              className="rounded-full object-cover"
              unoptimized
            />

            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>

              <p className="truncate text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="border-t">
            <Link
              href="/profile"
              className="
                block px-4 py-3
                text-sm
                hover:bg-gray-200 transition-all duration-300
              "
              onClick={handleGoToProfile}
            >
              Perfil
            </Link>
          </div>

          <div className="border-t">
            <button
              onClick={handleLogout}
              className="
                w-full px-4 py-3
                text-left text-sm text-red-600
                hover:bg-red-200 transition-all duration-300
                cursor-pointer
              "
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
