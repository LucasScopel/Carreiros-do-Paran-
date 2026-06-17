"use client";

import { useState } from "react";

import MenuWhiteboard from "@/app/components/menu-whiteboard";
import RoundedGreenInput from "@/app/components/rounded-orange-input";
import SubmitFilledGreenButton from "@/app/components/submit-filled-orange-button";

function CreateTrailForm() {
  // Estado que guarda todos os valores digitados no formulário.
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    coordinates: "",
    difficulty: "",
    distance: "",
    estimatedDuration: "",
  });

  // Atualiza o campo correto com base no atributo "name" de cada input.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Valida os campos, monta os dados da trilha e envia para a API.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Garante que nenhum campo obrigatório seja enviado vazio.
    if (
      !formData.name ||
      !formData.description ||
      !formData.location ||
      !formData.coordinates ||
      !formData.difficulty ||
      !formData.distance ||
      !formData.estimatedDuration
    ) {
      alert("Todos os campos são obrigatórios!");
      return;
    }

    // Evita aceitar nomes compostos só por números ou símbolos.
    if (!/[a-zA-ZÀ-ÿ]/.test(formData.name)) {
      alert("O nome da trilha deve conter letras.");
      return;
    }

    // Exige uma descrição um pouco mais completa do que apenas uma palavra curta.
    if (formData.description.trim().length < 10) {
      alert("A descrição deve ter pelo menos 10 caracteres.");
      return;
    }

    // Evita aceitar localizações compostas só por números ou símbolos.
    if (!/[a-zA-ZÀ-ÿ]/.test(formData.location)) {
      alert("A localização deve conter letras.");
      return;
    }

    const coordinatesMatch = formData.coordinates
      .trim()
      .match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);

    if (!coordinatesMatch) {
      alert("As coordenadas devem estar no padrão do Google Maps: latitude, longitude.");
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
      alert("Informe coordenadas válidas: latitude entre -90 e 90 e longitude entre -180 e 180.");
      return;
    }

    // O input vem como texto, então converte para número antes de comparar.
    if (Number(formData.distance) <= 0) {
      alert("A distância deve ser maior que zero.");
      return;
    }

    // Remove espaços antes de validar para não aceitar uma duração vazia.
    if (formData.estimatedDuration.trim().length <= 0) {
      alert("Informe uma duração estimada válida.");
      return;
    }

    // Objeto final enviado para a API. A distância é convertida para número.
    const trailData = {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      coordinates: `${latitude}, ${longitude}`,
      difficulty: formData.difficulty,
      distance: Number(formData.distance),
      estimatedDuration: formData.estimatedDuration,
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

      // Lê o JSON retornado pela API, seja em caso de sucesso ou de erro.
      const apiData = await response.json();

      if (!response.ok) {
        throw new Error(
          apiData.message || "Error when trying to create trail"
        );
      }

      console.log("Trail created", apiData);

      alert("Trilha cadastrada com sucesso!");
    } catch (error) {
      // Mostra o erro no console para depuração e uma mensagem simples para o usuário.
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
          name="coordinates"
          placeholder="Coordenadas (lat, lng)"
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

    
