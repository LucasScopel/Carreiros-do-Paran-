"use client";
import { useState, useEffect, useRef } from "react";

//Quais opções terão na filtragem
export type FilterType =
  | "all"
  | "newest"
  | "oldest"
  | "rating-desc"
  | "rating-asc"
  | "difficulty-desc"
  | "difficulty-asc";

interface FilterCommentsDropdownProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function FilterCommentsDropdown({
  currentFilter,
  onFilterChange,
}: FilterCommentsDropdownProps) {
  //Começa fechado e muda quando clicado
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const containerReference = useRef<HTMLDivElement>(null);

  // Mapeamento apenas para exibir outro texto para o usuário
  const getLabel = (filter: FilterType) => {
    switch (filter) {
      case "all":
        return "Todos";
      case "newest":
        return "Mais Recentes";
      case "oldest":
        return "Mais Antigos";
      case "rating-desc":
        return "Melhor Avaliados";
      case "rating-asc":
        return "Pior Avaliados";
      case "difficulty-desc":
        return "Maior Dificuldade";
      case "difficulty-asc":
        return "Menor Dificuldade";
      default:
        return "all";
    }
  };

  //Troca o filtro e fecha o dropdown
  const handleSelect = (filter: FilterType) => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  useEffect(() => {
    //Função para fechar o dropdown caso clique fora
    function handleClickOutside(event: MouseEvent) {
      // Se existir uma referência e o elementos clicado estiver fora dela, fecha o dropboxwh
      if (
        containerReference.current &&
        !containerReference.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    //Toda vez que o navegador perceber um clique, roda o comando.
    document.addEventListener("mousedown", handleClickOutside);

    //Ao fechar o dropdown, "limpa" o comando
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block w-60" ref={containerReference}>
      <button
        onClick={toggleDropdown}
        className="w-full px-6 py-3 rounded-xl shadow-md border text-left text-lg cursor-pointer focus:outline-none bg-gray-50 border-[#D99C6A] text-gray-800 font-medium hover:border-[#ff8119] hover:bg-gray-200 duration-200 transition-all flex items-center justify-between"
      >
        {/* Texto conforme o filtro */}
        <span>{getLabel(currentFilter)}</span>

        {/* Ícone de seta para indicar se o dropdwon está aberto ou fechado */}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {/* Menu do Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
          <ul className="py-1 text-sm text-gray-700">
            <li>
              <button
                onClick={() => handleSelect("all")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "all" ? "font-bold bg-gray-50" : ""}`}
              >
                Todos
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("newest")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "newest" ? "font-bold bg-gray-50" : ""}`}
              >
                Mais Recentes
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("oldest")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "oldest" ? "font-bold bg-gray-50" : ""}`}
              >
                Mais Antigos
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("rating-desc")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "rating-desc" ? "font-bold bg-gray-50" : ""}`}
              >
                Melhor Avaliados
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("rating-asc")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "rating-asc" ? "font-bold bg-gray-50" : ""}`}
              >
                Pior Avaliados
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("difficulty-desc")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "difficulty-desc" ? "font-bold bg-gray-50" : ""}`}
              >
                Maior Dificuldade
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("difficulty-asc")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "difficulty-asc" ? "font-bold bg-gray-50" : ""}`}
              >
                Menor Dificuldade
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
