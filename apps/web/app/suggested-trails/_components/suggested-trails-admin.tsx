"use client";

import { useEffect, useState } from "react";
import { SuggestionStatus, TrailSuggestion } from "../types";
import SuggestedTrailsList from "./suggested-trails-list";
import SuggestedTrailsDetail from "./suggested-trails-detail";

export default function SuggestedTrailsAdmin() {
  const [suggestions, setSuggestions] = useState<TrailSuggestion[]>([]);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // TODO (Backend): 
        const response = await fetch("/api/suggest-trails");
        
        if (!response.ok) {
          throw new Error("Falha ao carregar as sugestões da API.");
        }
        
        const data = await response.json();
        setSuggestions(data);
        
        
        if (data.length > 0) setSelectedSuggestionId(data[0].id);
      } catch (err) {
        console.warn("Aguardando backend implementar a rota GET:", err);
        setError("A aguardar ligação com o servidor para carregar as sugestões.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  
  const selectedSuggestion =
    suggestions.find((suggestion) => suggestion.id === selectedSuggestionId) ??
    suggestions[0] ??
    null;

  const setStatus = async (suggestionId: string, status: SuggestionStatus) => {
    
    // Atualiza a UI imediatamente antes da API responder, para dar a sensação de um sistema mais rápido.
    setSuggestions((previous) =>
      previous.map((suggestion) =>
        suggestion.id === suggestionId ? { ...suggestion, status } : suggestion,
      ),
    );

    try {
      // TODO (Backend): 
    } catch (err) {
      console.error("Erro ao atualizar o estado na API", err);
      // Aqui o ideal (no futuro) seria reverter a Atualização Otimista caso a API falhasse
    }
  };

  const deleteSuggestion = async (suggestionId: string) => {
    
    setSuggestions((previous) => {
      const filtered = previous.filter(
        (suggestion) => suggestion.id !== suggestionId,
      );
      // Se apagar a sugestão que estava aberta, seleciona a primeira da lista restante
      if (selectedSuggestionId === suggestionId) {
        setSelectedSuggestionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });

    try {
      // TODO (Backend): 
    } catch (err) {
      console.error("Erro ao eliminar a sugestão na API", err);
    }
  };

  // UI de Loading
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium">A carregar sugestões de trilhas...</div>;
  }

  // UI de Erro (quando não consegue ligar ao backend e a lista está vazia)
  if (error && suggestions.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-red-300 bg-red-50 p-6 text-red-600 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <SuggestedTrailsList
        suggestions={suggestions}
        selectedSuggestionId={selectedSuggestionId}
        onSelectSuggestion={setSelectedSuggestionId}
      />
      <SuggestedTrailsDetail
        selectedSuggestion={selectedSuggestion}
        onSetStatus={setStatus}
        onDeleteSuggestion={deleteSuggestion}
      />
    </div>
  );
}