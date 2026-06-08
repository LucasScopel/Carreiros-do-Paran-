"use client";

import { useState } from "react";

import MenuWhiteboard from "@/app/components/menu-whiteboard";
import RoundedGreenInput from "@/app/components/rounded-orange-input";
import SubmitFilledGreenButton from "@/app/components/submit-filled-orange-button";

function CreateTrailForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    difficulty: "",
    distance: "",
    estimatedDuration: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.location ||
      !formData.difficulty ||
      !formData.distance ||
      !formData.estimatedDuration
    ) {
      alert("Todos os campos são obrigatórios!");
      return;
    }

    const trailData = {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      difficulty: formData.difficulty,
      distance: Number(formData.distance),
      estimatedDuration: formData.estimatedDuration,
    };

    try {
      const response = await fetch("/api/trails/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trailData),
      });

      const apiData = await response.json();

      if (!response.ok) {
        throw new Error(
          apiData.message || "Error when trying to create trail"
        );
      }

      console.log("Trail created", apiData);

      alert("Trilha cadastrada com sucesso!");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro inesperado");
      }
    }
  };

  return (
    <MenuWhiteboard onSubmit={handleSubmit}>
      <div className="space-y-4 flex flex-col">
        <h1 className="text-[#263327] text-4xl font-bold text-center m-0">
          Cadastre uma Trilha
        </h1>

        <p className="text-center leading-tight mb-5">
          Adicione uma nova trilha
          <br />
          para a comunidade
        </p>

        <RoundedGreenInput
          type="text"
          name="name"
          placeholder="Nome da Trilha"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <RoundedGreenInput
          type="text"
          name="description"
          placeholder="Descrição"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <RoundedGreenInput
          type="text"
          name="location"
          placeholder="Localização"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <RoundedGreenInput
          type="text"
          name="difficulty"
          placeholder="Nível de Dificuldade"
          value={formData.difficulty}
          onChange={handleChange}
          required
        />

        <RoundedGreenInput
          type="number"
          name="distance"
          placeholder="Distância (km)"
          value={formData.distance}
          onChange={handleChange}
          required
        />

        <RoundedGreenInput
          type="text"
          name="estimatedDuration"
          placeholder="Duração Estimada"
          value={formData.estimatedDuration}
          onChange={handleChange}
          required
        />
      </div>

      <SubmitFilledGreenButton>
        Cadastrar Trilha
      </SubmitFilledGreenButton>
    </MenuWhiteboard>
  );
}

export default CreateTrailForm;