"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

/**
 * Busca o usuário autenticado.
 *
 * Retorna `null` quando não há autenticação (UNAUTHORIZED ou EMAIL_NOT_VERIFIED),
 * e lança erro para outras falhas da API.
 */
async function getMe() {
  const result = await api.users.me();

  if (!result.ok) {
    if (
      result.error.code === "UNAUTHORIZED" ||
      result.error.code === "EMAIL_NOT_VERIFIED"
    ) {
      return null;
    }

    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * Hook React Query para obter o usuário autenticado.
 *
 * Cacheado pela key `["me"]`.
 */
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000, // 5 minuto
  });
}
