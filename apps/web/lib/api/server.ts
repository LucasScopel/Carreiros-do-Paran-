import { ApiResult } from "shared/types";
import { baseApiFetch, createApi } from "shared/api";
import { cookies } from "next/headers";

/**
 * Implementação de fetch para o lado do servidor.
 *
 * Diferenças em relação ao client:
 * - Injeta cookies da requisição atual
 * - Usa API_URL como base URL
 *
 * É preferível utilizar a API pela interface {@link api}
 */
export async function apiServerFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const headers = new Headers(init?.headers);
  const cookieStore = await cookies();

  if (cookieStore.size > 0) {
    // O fetch executado no servidor não possui acesso automático aos cookies do usuário.
    // Por isso copiamos os cookies da requisição atual para o backend Express.
    headers.set("Cookie", cookieStore.toString());
  }

  return baseApiFetch(
    path,
    {
      ...init,
      headers,
    },

    // Server-side é necessário a URL completa da API
    process.env.API_URL,
  );
}

/**
 * Instância da API para uso no lado do servidor (Server Components).
 *
 * @see {@link ApiResult}
 */
export const api = createApi(apiServerFetch);
