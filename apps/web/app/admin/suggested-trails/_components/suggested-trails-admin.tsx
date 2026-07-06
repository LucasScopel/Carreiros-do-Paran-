"use client";

import { useState } from "react";
import SuggestedTrailsList from "./suggested-trails-list";
import SuggestedTrailsDetail from "./suggested-trails-detail";
import { TrailSuggestion } from "shared/types";

export default function SuggestedTrailsAdmin() {
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<TrailSuggestion | null>(null);

  return (
    <div className="flex-1 grid gap-6 grid-cols-[0.95fr_1.05fr]">
      <SuggestedTrailsList
        selectedSuggestionId={selectedSuggestion?.publicId}
        onSelectSuggestion={setSelectedSuggestion}
      />
      <SuggestedTrailsDetail
        selectedSuggestion={selectedSuggestion}
        onDelete={() => setSelectedSuggestion(null)}
      />
    </div>
  );
}
