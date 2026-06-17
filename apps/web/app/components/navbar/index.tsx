import { getCurrentUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import UserMenu from "./user";
import GuestMenu from "./guest";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav
      className="
        flex sticky
        top-0 z-50 h-16 px-4
        bg-white
        border-b border-zinc-200
        shadow-sm
        items-center justify-between
        text-black
        "
    >
      <div className="flex self-center items-center gap-3">
        <Link
          href="/"
          className="font-semibold text-lg inline-flex items-center gap-3"
        >
          <Image
            src="/logo.svg"
            alt="logo"
            width={48}
            height={48}
            unoptimized
          />
          Carreiros do Paraná
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? <UserMenu user={user} /> : <GuestMenu />}
      </div>
    </nav>
  );
}
