"use client";

import { useState } from "react";

import MenuWhiteboard from "@/app/components/menu-whiteboard";
import RoundedOrangeInput from "@/app/components/rounded-orange-input";
import SubmitFilledOrangeButton from "@/app/components/submit-filled-orange-button";

function CreateTrailForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    coordinates: "",
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

    const name = formData.name.trim();
    const description = formData.description.trim();
    const location = formData.location.trim();
    const coordinates = formData.coordinates.trim();

    // Validação básica: garante que nenhum campo essencial seja enviado em branco para a API.
    if (
      !name ||
      !description ||
      !location ||
      !coordinates ||
      !formData.difficulty ||
      !formData.distance ||
      !formData.estimatedDuration
    ) {
      alert("Todos os campos são obrigatórios!");
      return;
    }

    if (!/[a-zA-ZÀ-ÿ]/.test(name)) {
      alert("O nome da trilha deve conter letras.");
      return;
    }

    if (description.length < 10) {
      alert("A descrição deve ter pelo menos 10 caracteres.");
      return;
    }

    if (!/[a-zA-ZÀ-ÿ]/.test(location)) {
      alert("A localização deve conter letras.");
      return;
    }

    // Validação de Coordenadas Geográficas
    // O Regex abaixo exige o formato exato "latitude, longitude" com ou sem espaço após a vírgula.
    // Exemplo válido: "-23.5505, -46.6333"
    const coordinatesMatch = coordinates.match(
      /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/,
    );

    if (!coordinatesMatch) {
      alert("As coordenadas devem estar no padrão: latitude, longitude.");
      return;
    }

    const latitude = Number(coordinatesMatch[1]);
    const longitude = Number(coordinatesMatch[2]);

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      alert(
        "Informe coordenadas válidas: latitude entre -90 e 90 e longitude entre -180 e 180.",
      );
      return;
    }

    // O input do formulário sempre retorna texto (string).
    // Como a API exige que distância e duração sejam números, converte-se com Number() antes de validar.
    const distance = Number(formData.distance);

    if (isNaN(distance) || distance <= 0) {
      alert("A distância deve ser um número maior que zero.");
      return;
    }

    const duration = Number(formData.estimatedDuration);

    if (isNaN(duration) || duration <= 0) {
      alert("A duração deve ser um número maior que zero.");
      return;
    }

    const trailData = {
      name,
      description,
      location,
      coordinates: `${latitude}, ${longitude}`,
      difficulty: formData.difficulty,
      distance,
      estimatedDuration: duration,
    };

    // Bloco útil para testar a validação sem enviar dados para a API.
    // console.log("Trail data:", trailData);
    // alert("Trilha validada com sucesso!");
    // return;
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
        throw new Error(apiData.message || "Error when trying to create trail");
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

        <RoundedOrangeInput
          type="text"
          name="name"
          placeholder="Nome da Trilha"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <RoundedOrangeInput
          type="text"
          name="description"
          placeholder="Descrição"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <RoundedOrangeInput
          type="text"
          name="location"
          placeholder="Localização"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <RoundedOrangeInput
          type="text"
          name="coordinates"
          placeholder="Coordenadas (ex: -23.5505, -46.6333)"
          value={formData.coordinates}
          onChange={handleChange}
          required
        />

        <select
          name="difficulty"
          value={formData.difficulty}
          onChange={(e) =>
            setFormData((previous) => ({
              ...previous,
              difficulty: e.target.value,
            }))
          }
          required
          className="px-4 py-2 border-2 rounded-md text-black border-[#424242] bg-gray-100 focus:border-[#D99C6A] focus:outline-none hover:border-[#D99C6A] transition-colors duration-300"
        >
          <option value="">Selecione a dificuldade</option>
          <option value="easy">Fácil</option>
          <option value="medium">Médio</option>
          <option value="hard">Difícil</option>
        </select>

        <RoundedOrangeInput
          type="text"
          name="distance"
          placeholder="Distância em Quilômetros (ex:1.4)"
          value={formData.distance}
          onChange={handleChange}
          required
        />

        <RoundedOrangeInput
          type="text"
          name="estimatedDuration"
          placeholder="Duração Estimada em Minutos"
          value={formData.estimatedDuration}
          onChange={handleChange}
          required
        />
      </div>

      <SubmitFilledOrangeButton>Cadastrar Trilha</SubmitFilledOrangeButton>
    </MenuWhiteboard>
  );
}

export default CreateTrailForm;
