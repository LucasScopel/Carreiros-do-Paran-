"use client";

import Image from "next/image";
import Link from "next/link";
import { MeResponse } from "shared/types";

interface UserMenuProps {
  user: MeResponse;
}

export default function UserMenu({ user }: UserMenuProps) {
  return (
    <>
      <Link
        href="/profile"
        className="font-semibold inline-flex items-center gap-3"
      >
        <p>{user.name}</p>
        <Image
          src={user.avatarUrl}
          alt="avatar"
          width={40}
          height={40}
          className="rounded-full border-2 border-[#D99C6A]"
          unoptimized
        />
      </Link>
    </>
  );
}
