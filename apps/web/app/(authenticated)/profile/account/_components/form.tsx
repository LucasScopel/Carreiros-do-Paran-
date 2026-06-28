"use client";

import { useMe } from "@/hooks/useMe";
import { api } from "@/lib/api/client";
import { queryClient } from "@/lib/query";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { VisibilityLevel } from "shared/types";
import { toast } from "sonner";

export default function AccountForm() {
  const user = useMe();

  const [reviewsVisibility, setReviewsVisibility] = useState(
    user.data?.reviewsVisibility ?? "PUBLIC",
  );
  const [friendsVisibility, setFriendsVisibility] = useState(
    user.data?.friendsVisibility ?? "PUBLIC",
  );
  const hasConfigChanges = useRef(false);

  function handleChangeReviewVisibility(e: ChangeEvent<HTMLInputElement>) {
    setReviewsVisibility(e.target.value as VisibilityLevel);
    hasConfigChanges.current = true;
  }

  function handleChangeFriendVisibility(e: ChangeEvent<HTMLInputElement>) {
    setFriendsVisibility(e.target.value as VisibilityLevel);
    hasConfigChanges.current = true;
  }

  useEffect(() => {
    if (!hasConfigChanges.current) {
      return;
    }

    toast.loading("Alterações detectadas, salvando...", {
      id: "account-config-changes-toast",
    });

    const timer = setTimeout(async () => {
      const result = await api.users.updateMe({
        reviewsVisibility,
        friendsVisibility,
      });

      if (result.ok) {
        toast.success("Configurações salvas com sucesso!", {
          id: "account-config-changes-toast",
        });

        queryClient.invalidateQueries({ queryKey: ["me"] });
      } else {
        toast.error("Não foi possível salvar as configurações.", {
          id: "account-config-changes-toast",
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [reviewsVisibility, friendsVisibility]);

  if (user.isLoading) {
    return (
      <div className="flex flex-col gap-1 text-md text-zinc-900">
        Carregando...
      </div>
    );
  }

  if (user.error) {
    return (
      <div className="flex flex-col gap-1 text-md text-zinc-900">
        Algo deu errado...
      </div>
    );
  }

  return (
    <>
      <fieldset className="flex flex-col gap-1 text-md text-zinc-900">
        <legend className="font-medium mb-2">
          Quem pode ver suas avaliações na página do seu perfil?
        </legend>

        <label className="flex flex-row gap-3 ml-4">
          <input
            type="radio"
            name="reviewsVisibility"
            value="PUBLIC"
            checked={reviewsVisibility === "PUBLIC"}
            onChange={handleChangeReviewVisibility}
          />
          Todos
        </label>

        <label className="flex flex-row gap-3 ml-4">
          <input
            type="radio"
            name="reviewsVisibility"
            value="FRIENDS"
            checked={reviewsVisibility === "FRIENDS"}
            onChange={handleChangeReviewVisibility}
          />
          Meus amigos
        </label>

        <label className="flex flex-row gap-3 ml-4">
          <input
            type="radio"
            name="reviewsVisibility"
            value="PRIVATE"
            checked={reviewsVisibility === "PRIVATE"}
            onChange={handleChangeReviewVisibility}
          />
          Somente eu
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-1 text-md text-zinc-900 mt-4">
        <legend className="font-medium mb-2">
          Quem pode ver seus amigos na página do seu perfil?
        </legend>

        <label className="flex flex-row gap-3 ml-4">
          <input
            type="radio"
            name="friendsVisibility"
            value="PUBLIC"
            checked={friendsVisibility === "PUBLIC"}
            onChange={handleChangeFriendVisibility}
          />
          Todos
        </label>

        <label className="flex flex-row gap-3 ml-4">
          <input
            type="radio"
            name="friendsVisibility"
            value="FRIENDS"
            checked={friendsVisibility === "FRIENDS"}
            onChange={handleChangeFriendVisibility}
          />
          Meus amigos
        </label>

        <label className="flex flex-row gap-3 ml-4">
          <input
            type="radio"
            name="friendsVisibility"
            value="PRIVATE"
            checked={friendsVisibility === "PRIVATE"}
            onChange={handleChangeFriendVisibility}
          />
          Somente eu
        </label>
      </fieldset>
    </>
  );
}
