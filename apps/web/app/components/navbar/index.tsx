import { getCurrentUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import UserMenu from "./user";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="flex sticky top-0 z-50 bg-white h-16 items-center justify-between px-4">
      <div className="flex self-center items-center gap-3">
        <Link href="/" className="font-semibold inline-flex items-center gap-3">
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
        {user ? (
          <UserMenu user={user} />
        ) : (
          <>
            <Link
              href="/login"
              className="hover:bg-gray-200 transition-all duration-300
                         px-3 py-2 rounded-md cursor-pointer"
            >
              Entrar
            </Link>
            <Link
              href="/create-account"
              className="bg-[#D99C6A] hover:bg-[#c46518] transition-all duration-300
                         px-3 py-2 rounded-md text-white cursor-pointer"
            >
              Criar conta
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
