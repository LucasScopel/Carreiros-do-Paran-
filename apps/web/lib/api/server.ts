import { ApiResult } from "shared/types";
import { baseApiFetch, createApi } from "./base";
import { cookies } from "next/headers";

// O fetch executado no servidor não possui acesso automático
// aos cookies do usuário. Por isso copiamos os cookies da
// requisição atual para o backend Express.
export async function apiServerFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const headers = new Headers(init?.headers);
  const cookieStore = await cookies();

  if (cookieStore.size > 0) {
    headers.set("Cookie", cookieStore.toString());
  }

  return baseApiFetch(path, {
    ...init,
    headers,
  });
}

export const api = createApi(apiServerFetch);
