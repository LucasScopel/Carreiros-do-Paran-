import { redirect } from "next/navigation";
import { api } from "@/lib/api/server";

/**
 * Retorna o usuário autenticado, ou `null` se não estiver logado.
 *
 * Erros diferentes de `UNAUTHORIZED` são considerados falhas da API.
 */
export async function getCurrentUser() {
  const result = await api.users.me();

  if (!result.ok) {
    if (result.error.code === "UNAUTHORIZED") {
      return null;
    }

    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * Garante que exista um usuário autenticado.
 *
 * Se não houver autenticação, redireciona para /login.
 * Nunca retorna `null`.
 */
export async function requireAuth() {
  const result = await api.users.me();

  if (!result.ok) {
    redirect("/login");
  }

  return result.data;
}

/**
 * Garante que exista o usuário autenticado é admin.
 *
 * Se não houver autenticação, redireciona para /login.
 *
 * Se o usuário não for admin, redireciona para a página inicial.
 */
export async function requireAdmin() {
  const result = await api.users.me();

  if (!result.ok) {
    redirect("/login");
  }

  if (!result.data.admin) {
    redirect("/");
  }

  return result.data;
}
