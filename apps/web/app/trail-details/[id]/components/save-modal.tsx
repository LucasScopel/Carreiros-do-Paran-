import { X, Square, SquareCheck } from "lucide-react";
import { InfoCard } from "./info-card";
import { useState } from "react";

interface saveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

//Funçãozinha para trocar o ícone de salvo na coleção
function SaveIcon({ saved }: { saved: boolean }) {
  return saved ? (
    <SquareCheck className="w-6 h-6" />
  ) : (
    <Square className="w-6 h-6" />
  );
}

export default function SaveModal({ isOpen, onClose }: saveModalProps) {
  const [savedCollection, setSavedCollection] = useState(false);

  //Função para salvar aquela trilha na coleção
  const handleSaveCollection = () => {
    setSavedCollection((prev) => !prev);
  };

  //Se não estiver aberto, nem faz nada
  if (!isOpen) return null;

  return (
    //Efeito de escurecer o fundo
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      {/*A "caixa" do modal em si*/}
      <div
        className="bg-white rounded-xl shadow-xl px-6 py-6 w-full max-w-2xl mx-4 relative flex flex-col"
        onClick={(e) => e.stopPropagation()} //Impede de fechar ao clicar no modal
      >
        <div className="relative flex justify-center items-center">
          <h1 className="text-[#263327] text-4xl font-bold m-0">
            Salvar Trilha na Coleção
          </h1>

          <button
            className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            onClick={onClose}
          >
            <X size={32} />
          </button>
        </div>
        {/*Conteúdo do modal*/}
        <div className="mt-15 flex flex-col gap-4">
          <InfoCard
            className="border-green-900 hover:border-green-600 transition-colors cursor-pointer"
            onClick={handleSaveCollection}
          >
            <div className="flex items-center">
              <p className="text-lg text-gray-800">Salvas</p>
              <div
                className={`ml-auto cursor-pointer transition-colors
                            ${
                              savedCollection
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
              >
                <SaveIcon saved={savedCollection} />
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
