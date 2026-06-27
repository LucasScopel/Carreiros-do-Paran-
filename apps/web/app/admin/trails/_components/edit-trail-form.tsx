"use client";

import { api } from "@/lib/api/client";
import { ChangeEvent, SubmitEvent, useEffect, useRef, useState } from "react";
import { ApiResult, GeoCoords } from "shared/types";
import TextInput from "./text-input";
import { ExistingImage, FormImage, NewImage } from "./types";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { getImageKey, SortableImage } from "./sortable-image";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TrailInit {
  publicId: string;
  name: string;
  description: string;
  address: string;
  coordinates: GeoCoords;
  length: number;
  duration: number;
  images: ExistingImage[];
}

interface EditTrailProps {
  initial?: TrailInit;
}

export default function EditTrailForm({ initial }: EditTrailProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [coordinates, setCoordinates] = useState(
    initial?.coordinates ?? { lat: 0, lon: 0 },
  );
  const [length, setLength] = useState(initial?.length ?? 0);
  const [duration, setDuration] = useState(initial?.duration ?? 0);

  const [images, setImages] = useState<FormImage[]>(
    () =>
      initial?.images.map((image) => ({
        kind: "existing",
        image,
      })) ?? [],
  );

  useEffect(() => {
    const el = descriptionInputRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [description]);

  function showErrorToasts(result: ApiResult<unknown>) {
    if (result.ok) return;

    if (result.error.code === "VALIDATION_ERROR") {
      if (result.error.fields!.name) {
        toast.error("Nome muito curto.");
      }
      if (result.error.fields!.name) {
        toast.error("Descrição muito curta.");
      }
      if (result.error.fields!.name) {
        toast.error("Endereço muito curto.");
      }
      if (result.error.fields!.length) {
        toast.error("Tamanho do trajeto deve ser maior que zero.");
      }
      if (result.error.fields!.duration) {
        toast.error("Duração estimada deve ser maior que zero.");
      }
      if (result.error.fields!["coordinates.lat"]) {
        toast.error("Latitude deve estar entre -90 e 90.");
      }
      if (result.error.fields!["coordinates.lon"]) {
        toast.error("Latitude deve estar entre -90 e 90.");
      }
    } else if (result.error.code === "PAYLOAD_TOO_LARGE") {
      toast.error("Tamanho limite de imagens excedido.");
    } else if (result.error.code === "CONFLICT") {
      toast.error("Já existe uma trilha com esse nome.");
    } else {
      toast.error(result.error.message ?? "Erro interno no servidor");
    }

    setSaving(false);
  }

  function handleAddImages(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    if (!e.target.files) return;

    if (images.length + e.target.files.length > 10) {
      toast.error("Não é possível adicionar mais que 10 imagens a uma trilha.");
      return;
    }

    const filesArray = Array.from(e.target.files);

    e.target.value = "";

    if (filesArray.some((file) => file.size > 10 * 1024 * 1024)) {
      toast.error("Uma ou mais imagens ultrapassam o limite de 10 MB.");
      return;
    }

    const newImages: FormImage[] = filesArray.map((file) => ({
      kind: "new",
      image: {
        key: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      },
    }));

    setImages((old) => [...old, ...newImages]);
  }

  function handleRemoveImage(index: number) {
    setImages((old) => {
      const image = old[index];

      if (image?.kind === "new") {
        URL.revokeObjectURL(image.image.previewUrl);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      return old.filter((_, i) => i !== index);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) return;

    setImages((current) => {
      const oldIndex = current.findIndex(
        (image) => getImageKey(image) === active.id,
      );

      const newIndex = current.findIndex(
        (image) => getImageKey(image) === over.id,
      );

      return arrayMove(current, oldIndex, newIndex);
    });
  }

  function handleCancel() {
    router.replace("/admin/trails");
  }

  async function handleSave(e: SubmitEvent) {
    e.preventDefault();

    setSaving(true);

    if (!initial) {
      const trailPayload = {
        name,
        coordinates,
        description,
        address,
        length,
        duration,
      };

      const created = await api.trails.create(trailPayload);

      if (!created.ok) {
        showErrorToasts(created);
        setSaving(false);
        return;
      }

      const trailId = created.data.publicId;

      const newImages = images.filter((image) => image.kind === "new");

      if (newImages.length > 0) {
        const result = await api.trails.uploadImages(
          trailId,
          newImages.map((image) => image.image.file),
        );

        if (!result.ok) {
          router.push(`/admin/trails/${trailId}`);

          if (result.error.code === "PAYLOAD_TOO_LARGE") {
            toast.warning(
              "Trilha criada com sucesso, mas não foi possível adicionar as imagens: tamanho limite excedido.",
            );
          } else {
            showErrorToasts(result);
            toast.warning(
              "Trilha criada com sucesso, mas não foi possível adicionar as imagens.",
            );
          }

          setSaving(false);

          return;
        }
      }

      router.push(`/admin/trails/${trailId}`);

      toast.success("Trilha criada com sucesso!");

      setSaving(false);

      return;
    }

    const trailId = initial.publicId;

    const trailPayload = {
      name: name === initial.name ? undefined : name,
      coordinates:
        coordinates.lat === initial.coordinates.lat &&
        coordinates.lon === initial.coordinates.lon
          ? undefined
          : coordinates,
      description:
        description === initial.description ? undefined : description,
      address: address === initial.address ? undefined : address,
      length: length === initial.length ? undefined : length,
      duration: duration === initial.duration ? undefined : duration,
    };

    const updated = await api.trails.update(trailId, trailPayload);

    if (!updated.ok) {
      showErrorToasts(updated);
      return;
    }

    const originalIds = initial.images.map((img) => img.id);

    const currentExistingIds = images
      .filter(
        (
          image,
        ): image is {
          kind: "existing";
          image: ExistingImage;
        } => image.kind === "existing",
      )
      .map((image) => image.image.id);

    const deleted = originalIds.filter(
      (id) => !currentExistingIds.includes(id),
    );

    const newImages = images.filter(
      (
        image,
      ): image is {
        kind: "new";
        image: NewImage;
      } => image.kind === "new",
    );

    let latestImages: number[] = [];

    if (newImages.length > 0) {
      const result = await api.trails.uploadImages(
        trailId,
        newImages.map((image) => image.image.file),
      );

      if (!result.ok) {
        if (result.error.code === "PAYLOAD_TOO_LARGE") {
          toast.warning(
            "Trilha salva com sucesso, mas não foi possível adicionar as imagens: tamanho limite excedido.",
          );
        } else {
          showErrorToasts(result);
          toast.warning(
            "Trilha salva com sucesso, mas não foi possível adicionar as imagens.",
          );
        }

        router.push(`/admin/trails/${trailId}`);

        setSaving(false);
        return;
      }

      latestImages = result.data;
    }

    const ordered: number[] = [];

    const uploadedImages = latestImages.filter(
      (imageId) => !initial.images.some((original) => original.id === imageId),
    );

    let uploadedIndex = 0;

    for (const image of images) {
      if (image.kind === "existing") {
        ordered.push(image.image.id);
      } else {
        const uploaded = uploadedImages[uploadedIndex++];

        if (!uploaded) {
          setSaving(false);
          toast.error("Falha ao resolver imagem carregada.");
        }

        ordered.push(uploaded);
      }
    }

    const result = await api.trails.manageImages(trailId, {
      deleted,
      ordered,
    });

    if (!result.ok) {
      showErrorToasts(result);
      return;
    }

    toast.success("Trilha salva com sucesso!");

    router.push(`/admin/trails/${trailId}`);

    setSaving(false);
  }

  return (
    <div className="flex w-full min-h-full justify-center px-6 py-15 bg-slate-50">
      <div className="flex flex-col w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-zinc-900">
            {initial ? "Editar trilha" : "Nova trilha"}
          </h1>

          <p className="mt-1 text-md text-zinc-500">
            {initial
              ? "Configure os detalhes e mantenha as informações da trilha atualizadas."
              : "Cadastre uma nova trilha e compartilhe com a comunidade."}
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="
            flex flex-col flex-1
            rounded-2xl border border-zinc-200
            bg-white text-zinc-900
            p-8 gap-5
          "
        >
          <TextInput
            label="Nome"
            placeholder="Nome da trilha"
            name="name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />

          <label className="inline-flex flex-1 flex-col">
            Descrição
            <textarea
              ref={descriptionInputRef}
              name="description"
              placeholder="Descrição da trilha"
              value={description}
              required
              onChange={(e) => setDescription(e.target.value)}
              className="
                min-h-16 h-16 px-4 py-2 resize-none overflow-hidden
                border-2 rounded-md border-[#424242]
                text-black bg-zinc-100
                focus:border-[#D99C6A] focus:outline-none
                hover:border-[#D99C6A]
                transition-colors duration-300
              "
            />
          </label>

          <TextInput
            label="Endereço"
            placeholder="Endereço da trilha"
            name="address"
            value={address}
            required
            onChange={(e) => setAddress(e.target.value)}
          />

          <TextInput
            label="Tamanho do Trajeto (em quilômetros)"
            name="length"
            type="number"
            value={length}
            required
            onChange={(e) => setLength(Number(e.target.value))}
          />

          <TextInput
            label="Duração Estimada (em minutos)"
            name="duration"
            type="number"
            value={duration}
            required
            onChange={(e) => setDuration(Number(e.target.value))}
          />

          <div className="flex flex-row gap-5">
            <TextInput
              label="Latitude"
              name="coordinates-latitude"
              type="number"
              value={coordinates.lat}
              required
              onChange={(e) =>
                setCoordinates({
                  ...coordinates,
                  lat: Number(e.target.value),
                })
              }
            />

            <TextInput
              label="Longitude"
              name="coordinates-longitude"
              type="number"
              value={coordinates.lon}
              required
              onChange={(e) =>
                setCoordinates({
                  ...coordinates,
                  lon: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="flex flex-row items-center justify-between mt-8">
            <div className="flex flex-row items-baseline gap-5">
              <p className="text-xl font-semibold">Imagens</p>

              <p className="text-sm font-semibold text-zinc-700">
                Máx. 10 imagens (até 10 MB cada)
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
                inline-flex items-center
                gap-3 px-3 py-2
                rounded-md
                font-semibold text-md text-white
                bg-[#D99C6A] hover:bg-[#c46518]
                transition-all duration-300
                cursor-pointer
              "
            >
              <Plus />
              Adicionar
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.webp"
            onChange={handleAddImages}
            className="hidden"
          />

          <DndContext
            id="trail-images-dnd"
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map(getImageKey)}
              strategy={rectSortingStrategy}
            >
              {images.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  Nenhuma imagem adicionada.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-5">
                  {images.map((image, index) => (
                    <SortableImage
                      key={getImageKey(image)}
                      index={index}
                      image={image}
                      onRemove={() => handleRemoveImage(index)}
                    />
                  ))}
                </div>
              )}
            </SortableContext>
          </DndContext>

          <div className="flex flex-row justify-end gap-5 mt-10">
            <button
              type="button"
              disabled={saving}
              onClick={handleCancel}
              className="
                inline-flex justify-center items-center
                w-48 gap-3 px-3 py-2 rounded-md
                bg-zinc-200 text-slate-800
                text-slate-800
                hover:bg-zinc-300
                cursor-pointer
                transition-all duration-300
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex justify-center items-center
                w-48 gap-3 px-3 py-2 rounded-md
                bg-[#D99C6A]
                text-white font-semibold
                hover:bg-[#c46518] hover:brightness-120
                cursor-pointer
                transition-all duration-300
              "
            >
              <Save />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
