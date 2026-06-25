"use client";

import { useState } from "react";
import SuggestTrailInput from "./suggest-trail-input";
import SuggestTrailButton from "./suggest-trail-button";
import SuggestTrailWhiteboard from "./suggest-trail-whiteboard";
import { TrailSuggestion, SUGGESTED_TRAILS_STORAGE_KEY } from "../types";

function saveSuggestion(suggestion: TrailSuggestion) {
  if (typeof window === "undefined") return;

  try {
    const stored = window.localStorage.getItem(SUGGESTED_TRAILS_STORAGE_KEY);
    const current: TrailSuggestion[] = stored ? JSON.parse(stored) : [];
    window.localStorage.setItem(
      SUGGESTED_TRAILS_STORAGE_KEY,
      JSON.stringify([suggestion, ...current]),
    );
  } catch {
    window.localStorage.setItem(
      SUGGESTED_TRAILS_STORAGE_KEY,
      JSON.stringify([suggestion]),
    );
  }
}

export default function SuggestTrailForm() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    lengthKm: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const location = formData.location.trim();
    const description = formData.description.trim();
    const lengthKm = formData.lengthKm.trim();

    if (!name || !location || !lengthKm || !description) {
      return "Todos os campos são obrigatórios.";
    }

    if (!/[a-zA-ZÀ-ÿ]/.test(name)) {
      return "O nome deve conter letras válidas.";
    }

    if (!/[a-zA-ZÀ-ÿ]/.test(location)) {
      return "A localização deve conter letras válidas.";
    }

    const length = Number(lengthKm.replace(",", "."));

    if (Number.isNaN(length) || length <= 0) {
      return "O tamanho deve ser um número maior que zero.";
    }

    if (description.length < 10) {
      return "A descrição deve conter pelo menos 10 caracteres.";
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const error = validateForm();
    if (error) {
      setMessage(error);
      return;
    }

    const name = formData.name.trim();
    const location = formData.location.trim();
    const description = formData.description.trim();
    const length = Number(formData.lengthKm.trim().replace(",", "."));

    const newSuggestion: TrailSuggestion = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      name,
      location,
      lengthKm: length.toString(),
      description,
      status: "novo",
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/suggest-trails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          location,
          lengthKm: length,
          description,
        }),
      });

      if (!response.ok) {
        const jsonBody = await response.json().catch(() => null);
        throw new Error(jsonBody?.message ?? `HTTP ${response.status}`);
      }

      setMessage("Sugestão enviada com sucesso.");
    } catch (error) {
      console.warn("API de sugestão indisponível:", error);
      setMessage(
        "Sugestão registrada localmente. A API ainda não está disponível.",
      );
    } finally {
      saveSuggestion(newSuggestion);
      setFormData({ name: "", location: "", lengthKm: "", description: "" });
      setIsSubmitting(false);
    }
  };

  return (
    <SuggestTrailWhiteboard onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#263327]">Sugerir Trilha</h1>
          <p className="text-sm text-slate-600 mt-2">
            Envie uma sugestão de trilha com nome, localização e tamanho
            aproximado em quilômetros.
          </p>
        </div>

        <div className="grid gap-4">
          <SuggestTrailInput
            name="name"
            placeholder="Nome da trilha"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <SuggestTrailInput
            name="location"
            placeholder="Localização"
            value={formData.location}
            onChange={handleChange}
            required
          />
          <SuggestTrailInput
            type="number"
            name="lengthKm"
            placeholder="Tamanho aproximado (km)"
            value={formData.lengthKm}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Descrição da trilha"
            value={formData.description}
            onChange={handleChange}
            required
            className="min-h-30 resize-none rounded-md border-2 border-[#424242] bg-gray-100 px-4 py-3 text-black outline-none transition-colors duration-300 focus:border-[#D99C6A] hover:border-[#D99C6A]"
          />
        </div>

        {message ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}

        <SuggestTrailButton type="submit" className="w-full">
          {isSubmitting ? "Enviando..." : "Enviar Sugestão"}
        </SuggestTrailButton>
      </div>
    </SuggestTrailWhiteboard>
  );
}
