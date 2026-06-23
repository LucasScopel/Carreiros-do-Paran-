"use client";

import { useMemo, useRef, useState } from "react";
import { MeResponse } from "shared/types";
import EditableName from "./editable-name";
import EditableAvatar from "./editable-avatar";
import EditableDescription from "./editable-description";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserAvatarURL } from "shared/utils";

interface EditableProfileProps {
  user: MeResponse;
}

interface AvatarState {
  hasCustom: boolean;
  file: File | null;
}

export default function EditableProfile({ user }: EditableProfileProps) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [description, setDescription] = useState(user.description);
  const [avatar, setAvatar] = useState<AvatarState>({
    hasCustom: user.hasCustomAvatar,
    file: null,
  });
  const lastAvatar = useRef<AvatarState>({
    hasCustom: user.hasCustomAvatar,
    file: null,
  });

  const avatarUrl = useMemo(() => {
    if (avatar.file) {
      return URL.createObjectURL(avatar.file);
    }
    if (avatar.hasCustom) {
      return user.avatarUrl;
    }
    return getUserAvatarURL({
      hasAvatar: false,
      name: user.name,
    });
  }, [avatar, user]);

  function handleReset() {
    setName(user.name);
    setDescription(user.description);
    setAvatar({
      hasCustom: user.hasCustomAvatar,
      file: null,
    });
  }

  function handleChangeAvatar(file: File | null) {
    setAvatar({
      hasCustom: !!file,
      file,
    });
  }

  async function handleSave() {
    const newName = name.trim();
    const newDescription = description.trim();

    const data: Partial<{ name: string; description: string }> = {};

    if (newName !== user.name) {
      data.name = newName;
    }

    if (newDescription !== user.description) {
      data.description = newDescription;
    }

    if (Object.keys(data).length) {
      const result = await api.users.updateMe(data);

      if (!result.ok) {
        if (result.error.code === "VALIDATION_ERROR") {
          if (result.error.fields!.name) {
            toast.error("Nome muito curto ou muito grande.");
          }
          if (result.error.fields!.description) {
            toast.error("Descrição não pode passar de 300 caracteres.");
          }
        }
        return;
      }
    }

    if (
      lastAvatar.current.file !== avatar.file ||
      lastAvatar.current.hasCustom !== avatar.hasCustom
    ) {
      const result = avatar.file
        ? await api.users.uploadAvatar(avatar.file)
        : await api.users.removeAvatar();

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      lastAvatar.current.file = avatar.file;
      lastAvatar.current.hasCustom = avatar.hasCustom;
    }

    router.refresh();
  }

  return (
    <div
      className="
        flex flex-col flex-1
        rounded-2xl border border-zinc-200
        bg-white
        p-8
        gap-5
        "
    >
      <div className="flex flex-row flex-1 items-stretch gap-10">
        <EditableAvatar
          avatar={avatarUrl}
          hasCustomAvatar={avatar.hasCustom}
          onChange={handleChangeAvatar}
        />

        <div className="flex flex-1 flex-col">
          <div className="mt-6">
            <EditableName name={name} onChange={setName} />
          </div>

          <div className="mt-4 h-full">
            <EditableDescription
              description={description}
              onChange={setDescription}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-end gap-5">
        <button
          onClick={handleReset}
          className="py-2 rounded-md bg-zinc-200 text-slate-800 w-48 cursor-pointer hover:bg-zinc-300 transition-all duration-300"
        >
          Resetar
        </button>

        <button
          onClick={handleSave}
          className="py-2 rounded-md bg-[#D99C6A] text-white font-bold w-48 cursor-pointer hover:bg-[#c46518] hover:brightness-120 transition-all duration-300"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
