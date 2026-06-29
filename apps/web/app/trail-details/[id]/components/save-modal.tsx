"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { GetCollectionsContainingTrail } from "shared/types";
import { X, Loader2 } from "lucide-react";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailId: string;
  onRefreshStatus: () => void;
}

export default function SaveModal({
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
  }

  useEffect(() => {
    if (isOpen && trailId) {
      loadCollectionsStatus();
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">
            Salvar em uma coleção
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : collections.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-6">
              Você não possui nenhuma coleção criada.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {collections.map((collection) => (
                <div
                  key={collection.publicId}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <span className="font-medium text-gray-800">
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
                    className="w-5 h-5 accent-green-600 cursor-pointer disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
