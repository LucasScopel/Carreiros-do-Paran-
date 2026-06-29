import { getCurrentUser } from "@/lib/auth";
import LogoutAll from "../_components/logout-all";
import AccountForm from "./_components/form";

export default async function AccountProfilePage() {
  const user = (await getCurrentUser())!;

  return (
    <div
      className="
        flex flex-col flex-1
        rounded-2xl border border-zinc-200
        bg-white
        p-8
        gap-8
      "
    >
      <div>
        <h2 className="mb-3 text-xl font-semibold text-zinc-900">
          Informações da conta
        </h2>

        <p className="mb-8 text-md text-zinc-500">
          Essas são informações pessoais de sua conta, só você consegue vê-las.
        </p>

        <div
          className="
            grid grid-cols-2
            gap-y-4
            text-zinc-900 text-md
          "
        >
          <p className="font-semibold">E-mail</p>
          <p>{user.email}</p>

          <p className="font-semibold">Data de nascimento</p>
          <p>
            {new Date(user.birthDate).toLocaleDateString("pt-BR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <p className="font-semibold">Conta criada em</p>
          <p>
            {new Date(user.createdAt).toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="h-[1px] w-full mt-1 mb-1 bg-zinc-300" />

      <div className="flex flex-col gap-4">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900">
          Segurança e Privacidade
        </h2>

        <AccountForm />

        <LogoutAll />
      </div>
    </div>
  );
}
