import { ApiResult } from "shared/types";
import { baseApiFetch, createApi } from "shared/api";

/**
 * Implementação de fetch para o lado do cliente.
 *
 * É preferível utilizar a API pela interface {@link api}
 */
export const apiClientFetch: <T>(
  path: string,
  init?: RequestInit | undefined,
) => Promise<ApiResult<T>> = baseApiFetch;

/**
 * Instância da API para uso no lado do cliente (Client Components).
 *
 * @see {@link ApiResult}
 */
export const api = createApi(<T>(path: string, init?: RequestInit) =>
  baseApiFetch<T>(path, init, "/api"),
);
