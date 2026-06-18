import { getCurrentUser } from "@/lib/auth";
import EditableProfile from "./_components/editable-profile";
import LogoutAll from "./_components/logout-all";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;
  console.log(user.birthDate);
  return (
    <div className="flex w-full min-h-full justify-center px-6 py-15 bg-slate-50">
      <div className="flex flex-col w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-zinc-900">Perfil</h1>

          <p className="mt-1 text-md text-zinc-500">
            Veja e edite os detalhes do seu perfil.
          </p>
        </div>

        <EditableProfile user={user} />

        <div className="mt-12 mb-6">
          <h2 className="text-3xl font-semibold text-zinc-900">
            Informações pessoais
          </h2>

          <p className="mt-1 text-md text-zinc-500">
            Essas são informações pessoais de sua conta, só você consegue
            vê-las.
          </p>
        </div>

        <div
          className="
            flex flex-col flex-1
            rounded-2xl border border-zinc-200
            bg-white
            p-8
            gap-5
          "
        >
          <div
            className="
              grid grid-cols-2
              gap-y-4 mb-8
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

          <LogoutAll />
        </div>
      </div>
    </div>
  );
}
