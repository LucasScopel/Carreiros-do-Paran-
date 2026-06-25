"use client";

import { useEffect, useState } from "react";
import {
  SuggestionStatus,
  TrailSuggestion,
  SUGGESTED_TRAILS_STORAGE_KEY,
} from "../types";
import SuggestedTrailsList from "./suggested-trails-list";
import SuggestedTrailsDetail from "./suggested-trails-detail";

export default function SuggestedTrailsAdmin() {
  const [suggestions, setSuggestions] = useState<TrailSuggestion[]>([]);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(SUGGESTED_TRAILS_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored) as TrailSuggestion[];
      setSuggestions(parsed);
      if (parsed.length > 0) setSelectedSuggestionId(parsed[0].id);
    } catch {
      // ignore invalid storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      SUGGESTED_TRAILS_STORAGE_KEY,
      JSON.stringify(suggestions),
    );
  }, [suggestions]);

  const selectedSuggestion =
    suggestions.find((suggestion) => suggestion.id === selectedSuggestionId) ??
    suggestions[0] ??
    null;

  const setStatus = (suggestionId: string, status: SuggestionStatus) => {
    setSuggestions((previous) =>
      previous.map((suggestion) =>
        suggestion.id === suggestionId ? { ...suggestion, status } : suggestion,
      ),
    );
  };

  const deleteSuggestion = (suggestionId: string) => {
    setSuggestions((previous) => {
      const filtered = previous.filter(
        (suggestion) => suggestion.id !== suggestionId,
      );
      if (selectedSuggestionId === suggestionId) {
        setSelectedSuggestionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

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
