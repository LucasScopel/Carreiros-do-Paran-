"use client";
import React, { useEffect, useState, RefObject } from "react";
import { api } from "@/lib/api/client";
import { GetCollectionsContainingTrail } from "shared/types";
import { X, Loader2 } from "lucide-react";
import AddCollectionModal from "@/app/components/add-collection-modal";

interface SaveModalProps {
  modalRef?: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
  trailId: string;
  onRefreshStatus: () => void;
}

export default function SaveModal({
  modalRef,
  isOpen,
  onClose,
  trailId,
  onRefreshStatus,
}: SaveModalProps) {
  const [collections, setCollections] = useState<GetCollectionsContainingTrail>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Carrega as coleções e verifica quais já contêm esta trilha
  async function loadCollectionsStatus() {
    try {
      setLoading(true);
      const result = await api.users.collections.getContainingTrail(trailId);
      if (result.ok) {
        setCollections(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar coleções:", error);
    } finally {
      setLoading(false);
    }

    setReady(true); //Só permite carregar o modal depois que já tiver determinado a altura máxima
  }

  useEffect(() => {
    if (isOpen && trailId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCollectionsStatus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, trailId]);

  // Alterna o estado da trilha na coleção (Salva / Remove)
  async function handleToggleCollection(
    collectionId: string,
    containsTrail: boolean,
  ) {
    try {
      setUpdatingId(collectionId);

      if (containsTrail) {
        // Se já contém, remove
        const res = await api.users.collections.removeTrail(
          collectionId,
          trailId,
        );
        if (!res.ok) throw new Error();
      } else {
        // Se não contém, adiciona
        const res = await api.users.collections.addTrail(collectionId, trailId);
        if (!res.ok) throw new Error();
      }

      // Atualiza o estado local rapidamente para dar feedback ao usuário
      setCollections((prev) =>
        prev.map((col) =>
          col.publicId === collectionId
            ? { ...col, containsTrail: !containsTrail }
            : col,
        ),
      );

      // Notifica a tela principal para atualizar o estado do botão "Salvar"
      onRefreshStatus();
    } catch (error) {
      console.error("Erro ao atualizar coleção:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  function onCloseCreateCollectionModal(hasCreated?: boolean) {
    setIsCreateModalOpen(false);

    if (hasCreated) {
      loadCollectionsStatus();
    }
  }

  if (!isOpen || !ready) return null;

  return (
    <div
      className={`fixed inset-0 bg-black backdrop-blur-sm z-50 flex items-center justify-center p-4
                     ${isCreateModalOpen ? "bg-transparent" : "bg-black/60"}`}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 pb-4"
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <h3 className="text-xl font-bold text-gray-900">
            Salvar em uma Coleção
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="cursor-pointer" size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="max-h-80 overflow-y-auto py-2 flex justify-center mb-3">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : collections.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-6">
              Você não possui nenhuma coleção criada.
            </p>
          ) : (
            <div className="flex flex-col gap-1 px-4 w-full">
              {collections.map((collection) => (
                <label
                  key={collection.publicId}
                  className={`
                              flex items-center justify-between p-5 rounded-xl 
                              cursor-pointer select-none transition-all duration-200
                              active:scale-[0.99]
                              ${
                                collection.containsTrail
                                  ? "bg-green-200/50 hover:bg-green-200/80"
                                  : "bg-gray-200/70 hover:bg-gray-300/70"
                              }
                            `}
                >
                  <span
                    className={`text-sm transition-colors ${
                      collection.containsTrail
                        ? "text-green-900 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {collection.name}
                  </span>

                  <input
                    type="checkbox"
                    checked={collection.containsTrail}
                    disabled={updatingId === collection.publicId}
                    onChange={() =>
                      handleToggleCollection(
                        collection.publicId,
                        collection.containsTrail,
                      )
                    }
                    className="w-5 h-5 accent-green-600 cursor-pointer rounded"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Botão de adicionar coleção */}
        <div className="px-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full p-3 rounded-xl cursor-pointer bg-transparent border-3 border-dashed border-green-700 hover:border-green-600 text-green-900 hover:text-green-700 font-medium transition-all duration-200"
          >
            Adicionar Coleção
          </button>

          {isCreateModalOpen && (
            <AddCollectionModal
              onClose={(e?: boolean) => onCloseCreateCollectionModal(e)}
              themeColors={{
                borderDefault: "border-green-800",
                borderHover: "hover:border-green-500",
                focusBorder: "focus:border-green-500",
                saveButtonBg: "bg-green-800",
                saveButtonHoover: "hover:bg-green-700",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
