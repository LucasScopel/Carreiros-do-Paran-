export type SuggestionStatus = "novo" | "a fazer" | "em andamento";

export interface TrailSuggestion {
  id: string;
  name: string;
  location: string;
  lengthKm: number;
  description: string;
  status: SuggestionStatus;
  createdAt: string;
}


