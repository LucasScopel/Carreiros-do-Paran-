import { getCurrentUser } from "@/lib/auth";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ProfileTabs from "@/app/components/profile-tabs";

export default async function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = (await getCurrentUser())!;

  return (
    <div className="flex w-full min-h-full justify-center px-6 py-15 bg-slate-50">
      <div className="flex flex-col w-full max-w-4xl">
        <div className="flex flex-row justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold text-zinc-900">
              Minha conta
            </h1>

            <p className="mt-1 text-md text-zinc-500">
              Gerencie seu perfil, avaliações, coleções, amizades e
              configurações da sua conta.
            </p>
          </div>
          <Link
            href={`/users/${user.publicId}`}
            className="
              inline-flex justify-center items-center
              w-40 h-10 px-3 py-2 hover:w-46
              rounded-md
              text-md text-slate-800
              bg-zinc-200 hover:bg-zinc-300
              transition-all duration-300
              cursor-pointer
              group relative whitespace-nowrap
            "
          >
            <span className="font-medium transition-transform duration-300 group-hover:-translate-x-3">
              Ver perfil público
            </span>
            <ArrowRight className="absolute right-3 h-4 w-4 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </Link>
        </div>

        <ProfileTabs
          tabs={[
            {
              name: "Meu perfil",
              href: "/profile",
            },
            {
              name: "Avaliações",
              href: "/profile/reviews",
            },
            {
              name: "Coleções",
              href: "/profile/collections",
            },
            {
              name: "Amigos",
              href: "/profile/friends",
            },
            {
              name: "Configurações",
              href: "/profile/account",
            },
          ]}
        />

        {children}
      </div>
    </div>
  );
}
