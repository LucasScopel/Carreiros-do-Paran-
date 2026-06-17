import Link from "next/link";

export default function GuestMenu() {
  return (
    <>
      <Link
        href="/login"
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
        href="/create-account"
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
