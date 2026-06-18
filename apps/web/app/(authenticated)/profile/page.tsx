import { getCurrentUser } from "@/lib/auth";
import EditableProfile from "./_components/editable-profile";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;

  return (
    <div className="flex w-full min-h-full justify-center px-6 py-15 bg-slate-50">
      <div className="flex flex-col w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-zinc-900">Perfil</h1>

          <p className="mt-1 text-md text-zinc-500">
            Veja e edite suas informações pessoais e detalhes do perfil.
          </p>
        </div>

        <EditableProfile user={user} />
      </div>
    </div>
  );
}
