"use client";

import { api } from "@/lib/api/client";
import Image from "next/image";
import { ChangeEvent, SubmitEvent, useEffect, useRef, useState } from "react";
import { ApiResult, GeoCoords, TrailResponse } from "shared/types";
import TextInput from "./text-input";
import { ExistingImage, FormImage, NewImage } from "./types";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { getImageKey, SortableImage } from "./sortable-image";
import { Plus } from "lucide-react";
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

  function showErrorToasts(result: ApiResult<unknown>) {
    if (result.ok) return;

    if (result.error.code === "VALIDATION_ERROR") {
      console.log(result.error.fields);
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
    } else {
      toast.error(result.error.message);
    }

    setSaving(false);
  }

  function handleAddImages(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    if (!e.target.files) return;

    const newImages: FormImage[] = Array.from(e.target.files).map((file) => ({
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
        const formData = new FormData();

        newImages.forEach((image) => {
          formData.append("images", image.image.file);
        });

        await api.trails.uploadImages(
          trailId,
          newImages.map((image) => image.image.file),
        );
      }

      router.push(`/admin/trails/${trailId}`);

      toast.success("Trilha criada com sucesso!");

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
    console.log(trailPayload);
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
        showErrorToasts(result);
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
          throw new Error("Failed to resolve uploaded image");
        }

        ordered.push(uploaded);
      }
    }

    console.log(deleted, ordered);

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
            name="name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />

          <label className="inline-flex flex-1 flex-col">
            Descrição
            <textarea
              name="description"
              value={description}
              required
              onChange={(e) => setDescription(e.target.value)}
              className="
                px-4 py-2
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
            name="address"
            value={address}
            required
            onChange={(e) => setAddress(e.target.value)}
          />

          <TextInput
            label="Tamanho do Trajeto (em Quilômetros)"
            name="length"
            type="number"
            value={length}
            required
            onChange={(e) => setLength(Number(e.target.value))}
          />

          <TextInput
            label="Duração Estimada"
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
            <p className="text-xl font-semibold">Imagens</p>

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
                  <p>Nenhuma imagem adicionada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-5">
                  {images.map((image, index) => (
                    <SortableImage
                      key={getImageKey(image)}
                      image={image}
                      onRemove={() => handleRemoveImage(index)}
                    />
                  ))}
                </div>
              )}
            </SortableContext>
          </DndContext>

          <div className="flex flex-row justify-end gap-5">
            <button
              type="submit"
              className="py-2 rounded-md bg-[#D99C6A] text-white font-bold w-48 cursor-pointer hover:bg-[#c46518] hover:brightness-120 transition-all duration-300"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
