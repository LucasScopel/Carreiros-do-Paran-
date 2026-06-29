"use client";

import { api } from "@/lib/api/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MeResponse } from "shared/types";
import {
  ClipboardList,
  Footprints,
  Lightbulb,
  LogOut,
  UserRound,
} from "lucide-react";

const MENU_ICONS = {
  footprints: () => <Footprints />,
  user_round: () => <UserRound />,
  lightbulb: () => <Lightbulb />,
  clipboard_list: () => <ClipboardList />,
} as const;

export interface UserMenuItem {
  icon: keyof typeof MENU_ICONS;
  label: string;
  href: string;
}

interface UserMenuProps {
  user: MeResponse;
  items: UserMenuItem[];
}

export default function UserMenu({ user, items }: UserMenuProps) {
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

  function handleClickItem() {
    setOpen(false);
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
            rounded-lg border border-zinc-900
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

          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                inline-flex items-center gap-3
                w-full px-4 py-3 border-t border-zinc-900
                text-sm text-zinc-900 font-semibold
                hover:bg-gray-200 transition-all duration-300
              "
              onClick={handleClickItem}
            >
              {MENU_ICONS[item.icon]()}
              {item.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="
              inline-flex items-center gap-3
              w-full px-4 py-3 border-t border-zinc-900
              text-sm text-red-600 font-semibold
              hover:bg-red-200 transition-all duration-300
              cursor-pointer
            "
          >
            <LogOut />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
