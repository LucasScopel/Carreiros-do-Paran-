import { api } from "@/lib/api/server";
import { cache } from "react";

/**
 * Retorna o usuário autenticado, ou `null` se não estiver logado.
 *
 * Erros diferentes de `UNAUTHORIZED` ou `EMAIL_NOT_VERIFIED` são considerados falhas da API.
 */
export const getCurrentUser = cache(async () => {
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
});
