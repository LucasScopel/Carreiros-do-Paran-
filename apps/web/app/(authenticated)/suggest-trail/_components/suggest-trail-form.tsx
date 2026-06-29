"use client";

import { useState } from "react";
import SuggestTrailInput from "./suggest-trail-input";
import SuggestTrailButton from "./suggest-trail-button";
import { api } from "@/lib/api/client";

export default function SuggestTrailForm() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    lengthKm: "",
    details: "",
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
    const details = formData.details.trim();
    const lengthKm = formData.lengthKm.trim();

    if (!name || !location || !lengthKm || !details) {
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

    if (details.length < 10) {
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
    const details = formData.details.trim();
    const length = Number(formData.lengthKm.trim().replace(",", "."));

    setIsSubmitting(true);
    setMessage(null);

    //API
    try {
      const response = await api.trails.suggestions.create({
        name,
        location,
        length,
        details,
      });

      if (!response.ok) {
        if (response.error.code === "VALIDATION_ERROR") {
          if (response.error.fields!.name) {
            setMessage("Nome muito curto ou muito longo.");
          } else if (response.error.fields!.details) {
            setMessage("Detalhes muito longos.");
          } else if (response.error.fields!.location) {
            setMessage("Localização muito curta ou muito longa.");
          } else {
            setMessage(
              "Não foi possível enviar a sugestão no momento. Tente novamente mais tarde.",
            );
          }
        }
        return;
      }

      setMessage("Sugestão enviada com sucesso!");
      setFormData({ name: "", location: "", lengthKm: "", details: "" });
    } catch (error) {
      console.error("Erro ao submeter à API:", error);
      setMessage(
        "Não foi possível enviar a sugestão no momento. Tente novamente mais tarde.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-full px-6 py-6 bg-white rounded-md flex flex-col border-2"
    >
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
            name="details"
            placeholder="Descrição da trilha"
            value={formData.details}
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
      </div>

      <SuggestTrailButton type="submit" className="w-full">
        {isSubmitting ? "Enviando..." : "Enviar Sugestão"}
      </SuggestTrailButton>
    </form>
  );
}
