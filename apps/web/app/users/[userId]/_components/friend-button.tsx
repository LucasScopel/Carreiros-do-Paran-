"use client";

import FriendRemoveConfirmation from "@/app/components/friend-remove-confirmation";
import { api } from "@/lib/api/client";
import { queryClient } from "@/lib/query";
import { Check, Send, UserRoundPlus, UserRoundX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GetUserResponse, MeResponse } from "shared/types";
import { toast } from "sonner";

interface Props {
  viewer: MeResponse | null;
  owner: GetUserResponse;
}

export default function FriendButton({ viewer, owner }: Props) {
  const router = useRouter();
  const [remove, setRemove] = useState(false);

  if (!viewer) return null;

  async function handleRemoveFriend() {
    if (!remove) return;

    const result = await api.users.friends.remove(owner.publicId);

    if (result.ok) {
      if (result.data.message === "ended") {
        toast.success("Amigo removido com sucesso!");
      } else if (result.data.message === "canceled") {
        toast.success("Pedido de amizade cancelado!");
      } else if (result.data.message === "rejected") {
        toast.success("Pedido de amizade rejeitado!");
      }

      queryClient.invalidateQueries({ queryKey: ["me"] });

      router.refresh();
    } else {
      toast.error("Não foi possível remover este amigo.");
    }

    setRemove(false);
  }

  async function handleAddFriend() {
    const result = await api.users.friends.add(owner.publicId);

    if (result.ok) {
      if (result.status === 201) {
        toast.success("Pedido de amizade enviado!");
      } else {
        toast.success("Amigo adicionado com sucesso!");

        queryClient.invalidateQueries({ queryKey: ["me"] });
      }

      router.refresh();
    } else {
      toast.error("Não foi possível adicionar este amigo.");
    }
  }

  function handleClick() {
    if (owner.friendshipStatus === "friends") {
      setRemove(true);
    } else if (owner.friendshipStatus === "request-sent") {
      toast.info("Você já enviou um pedido de amizade a este usuário!");
    } else if (owner.friendshipStatus === "request-received") {
      handleRemoveFriend();
    } else {
      handleAddFriend();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="
          inline-flex justify-center items-center
          w-[80%] h-10 px-3 py-2 gap-3
          self-center rounded-md
          font-semibold text-md text-slate-800
          bg-zinc-200 hover:bg-zinc-300
          transition-all duration-300
          cursor-pointer
        "
      >
        {owner.friendshipStatus === "friends" ? (
          <>
            <UserRoundX />
            Desfazer amizade
          </>
        ) : owner.friendshipStatus === "request-sent" ? (
          <>
            <Send />
            Pedido enviado
          </>
        ) : owner.friendshipStatus === "request-received" ? (
          <>
            <Check />
            Aceitar amizade
          </>
        ) : (
          <>
            <UserRoundPlus />
            Adicionar amigo
          </>
        )}
      </button>
      {remove && (
        <FriendRemoveConfirmation
          friendName={owner.name}
          onCancel={() => setRemove(false)}
          onRemove={handleRemoveFriend}
        />
      )}
    </>
  );
}
