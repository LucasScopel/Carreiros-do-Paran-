import { ApiErrorResponse, ApiResult, MeResponse } from "shared/types";

/**
 * Função utilitária base responsável por realizar chamadas HTTP para a API.
 *
 * - Adiciona automaticamente `Content-Type: application/json` quando necessário
 * - Faz parsing seguro da resposta JSON
 * - Normaliza respostas em {@link ApiResult}
 * - Diferencia erros esperados ({@link ApiErrorResponse}) de erros inesperados
 */
export async function baseApiFetch<T>(
  path: string,
  init?: RequestInit,
  baseUrl: string = "",
): Promise<ApiResult<T>> {
  const headers = new Headers(init?.headers);

  // Se existir um body e ele não for FormData,
  // assumimos que estamos enviando JSON.
  if (
    init?.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Faz a requisição para a rota da API
  const response = await fetch(`${baseUrl}/api${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  let body: unknown;

  try {
    // Respostas 204 não possuem corpo
    body = response.status === 204 ? undefined : await response.json();
  } catch {
    // Toda resposta da API deve ser JSON válido
    // Caso contrário consideramos um erro inesperado
    throw new Error("Invalid JSON response from server");
  }

  if (!response.ok) {
    // Quando a API retorna um erro no formato esperado,
    // convertemos para ApiResult com ok: false
    if (typeof body === "object" && body !== null && "code" in body) {
      return {
        ok: false,
        status: response.status,
        error: body as ApiErrorResponse,
      };
    }

    // Erros fora do formato padrão são tratados como falha inesperada
    throw new Error("Server returned an invalid error response");
  }

  // Respostas de sucesso retornam os dados tipados
  return {
    ok: true,
    status: response.status,
    data: body as T,
  };
}

export type ApiFetcher = <T>(
  path: string,
  init?: RequestInit | undefined,
) => Promise<ApiResult<T>>;

/**
 * Fábrica que cria um client de API fortemente tipado.
 *
 * Recebe uma implementação de fetch ({@link ApiFetcher}) e retorna
 * um conjunto de métodos organizados por domínio (auth, users, etc).
 *
 * Permite reutilizar a mesma definição de endpoints em:
 * - Client (browser)
 * - Server (Next.js SSR)
 *
 * @see {@link ApiResult}
 */
export function createApi(fetcher: ApiFetcher) {
  return {
    auth: {
      register(email: string, password: string) {
        return fetcher<void>("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
      },

      login(email: string, password: string, rememberMe: boolean) {
        return fetcher<void>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password, rememberMe }),
        });
      },

      logout() {
        return fetcher<void>("/auth/logout", {
          method: "POST",
        });
      },

      logoutAll() {
        return fetcher<void>("/auth/logout-all", {
          method: "POST",
        });
      },

      verifyEmail(token: string) {
        return fetcher<void>("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
      },

      resendVerificationEmail() {
        return fetcher<void>("/auth/resend-verification-email", {
          method: "POST",
        });
      },

      forgotPassword(email: string) {
        return fetcher<void>("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
      },

      resetPassword(token: string, password: string) {
        return fetcher<void>("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ token, password }),
        });
      },
    },

    users: {
      me() {
        return fetcher<MeResponse>("/users/me", {
          method: "GET",
        });
      },
    },
  };
}
