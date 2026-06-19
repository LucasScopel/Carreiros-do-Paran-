"use client";

import Image from "next/image";
import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

// Componente de layout que encapsula o formulário de criação da trilha.
// Recebe filhos React para renderizar campos e botões dentro do card.
interface MenuWhiteboardProps {
  children?: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
}

function MenuWhiteboard({ children, onSubmit }: MenuWhiteboardProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-125 h-140 px-6 py-6 bg-white rounded-md flex flex-col"
    >
      {children}
    </form>
  );
}

// Input reutilizável com estilo uniforme para campos do formulário.
interface RoundedOrangeInputProps {
  type?: "text" | "password" | "date" | "email" | "number";
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

function RoundedOrangeInput({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required = false,
}: RoundedOrangeInputProps) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="px-4 py-2 border-2 rounded-md text-black border-[#424242] bg-gray-100 focus:border-[#D99C6A] focus:outline-none hover:border-[#D99C6A] transition-colors duration-300"
    />
  );
}

interface SubmitFilledOrangeButtonProps {
  children: ReactNode;
  className?: string;
}

function SubmitFilledOrangeButton({
  children,
  className = "",
}: SubmitFilledOrangeButtonProps) {
  return (
    <button
      type="submit"
      className={`py-2 rounded-md bg-[#D99C6A] text-white font-bold w-48 cursor-pointer hover:bg-[#c46518] hover:brightness-120 transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  );
}

function CreateTrailForm() {
  // Estado local para armazenar valores de todos os campos do formulário.
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    coordinates: "",
    difficulty: "",
    length: "",
    estimatedDuration: "",
  });

  // Estado para gerenciar imagens selecionadas e suas URLs de pré-visualização.
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Atualiza o estado de formulário para o campo correspondente.
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Adiciona imagens selecionadas ao estado e cria URLs de pré-visualização.
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const previews = files.map((file) => URL.createObjectURL(file));

    setSelectedImages((previous) => [...previous, ...files]);
    setImagePreviews((previous) => [...previous, ...previews]);
  };

  // Remove imagem selecionada e revoga o URL de pré-visualização para liberar memória.
  const handleRemoveImage = (index: number) => {
    setSelectedImages((previous) => previous.filter((_, i) => i !== index));
    setImagePreviews((previous) => {
      const removedUrl = previous[index];
      if (removedUrl) URL.revokeObjectURL(removedUrl);
      return previous.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      !formData.length ||
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
    // Como a API exige que comprimento e duração sejam números, converte-se com Number() antes de validar.
    const length = Number(formData.length);

    if (isNaN(length) || length <= 0) {
      alert("O tamanho do trajeto deve ser um número maior que zero.");
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
      length,
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
          name="length"
          placeholder="Tamanho do Trajeto em Quilômetros (ex:1.4)"
          value={formData.length}
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

        <div className="flex flex-col gap-2">
          <label htmlFor="images" className="font-medium text-[#263327]">
            Imagens da trilha
          </label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="px-4 py-2 border-2 rounded-md text-black border-[#424242] bg-gray-100 focus:border-[#D99C6A] focus:outline-none hover:border-[#D99C6A] transition-colors duration-300"
          />
          {selectedImages.length > 0 && (
            <div className="text-sm text-[#4a4a4a]">
              {selectedImages.length} imagem(ns) selecionada(s):
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedImages.map((file, index) => (
                  <span
                    key={`${file.name}-${index}`}
                    className="rounded-full bg-[#f2f2f2] px-3 py-1 text-xs text-[#333]"
                  >
                    {file.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3 max-h-72 overflow-y-auto">
              {imagePreviews.map((previewUrl, index) => (
                <div
                  key={`${previewUrl}-${index}`}
                  className="relative rounded-md overflow-hidden border border-gray-200 bg-white h-28"
                >
                  <Image
                    src={previewUrl}
                    alt={`Pré-visualização ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <SubmitFilledOrangeButton className="w-full md:w-auto self-center mt-4">
          Cadastrar Trilha
        </SubmitFilledOrangeButton>
      </div>
    </MenuWhiteboard>
  );
}

export default CreateTrailForm;
