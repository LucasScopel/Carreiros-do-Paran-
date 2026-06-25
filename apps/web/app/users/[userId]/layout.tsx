import ProfileTabs from "@/app/components/profile-tabs";
import { PropsWithChildren } from "react";

interface Props {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ProfileLayout({
  params,
  children,
}: Props & PropsWithChildren) {
  const { userId } = await params;

  return (
    <div className="flex w-full min-h-full justify-center px-6 py-15 bg-slate-50">
      <div className="flex flex-col w-full max-w-4xl">
        <ProfileTabs
          tabs={[
            {
              name: "Perfil",
              href: `/users/${userId}`,
            },
            {
              name: "Avaliações",
              href: `/users/${userId}/reviews`,
            },
          ]}
        />

        {children}
      </div>
    </div>
  );
}
