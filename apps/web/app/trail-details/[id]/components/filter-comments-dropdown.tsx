"use client";
import { useState, useEffect, useRef } from "react";

//Quais opções terão na filtragem
export type FilterType =
  | "all"
  | "star-5"
  | "star-1"
  | "diff-5"
  | "diff-1"
  | "new"
  | "old";

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
      case "star-5":
        return "Melhor Avaliado";
      case "star-1":
        return "Pior Avaliado";
      case "diff-5":
        return "Muito Difícil";
      case "diff-1":
        return "Muito Fácil";
      case "new":
        return "Mais Recentes";
      case "old":
        return "Mais Antigos";
      default:
        return "Filtrar";
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

        {/* Ícone de seta simples */}
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
                Todos os comentários
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("star-5")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "star-5" ? "font-bold bg-gray-50" : ""}`}
              >
                Melhor Avaliados
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("star-1")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "star-1" ? "font-bold bg-gray-50" : ""}`}
              >
                Pior Avaliados
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("diff-5")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "diff-5" ? "font-bold bg-gray-50" : ""}`}
              >
                Muito Difícil
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("diff-1")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "diff-1" ? "font-bold bg-gray-50" : ""}`}
              >
                Muito Fácil
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("diff-1")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "new" ? "font-bold bg-gray-50" : ""}`}
              >
                Mais Recentes
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect("diff-1")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentFilter === "old" ? "font-bold bg-gray-50" : ""}`}
              >
                Mais Antigos
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
