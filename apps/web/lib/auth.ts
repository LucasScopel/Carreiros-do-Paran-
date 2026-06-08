import { redirect } from "next/navigation";
import { api } from "@/lib/api/server";

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

export async function requireAuth() {
  const result = await api.users.me();

  if (!result.ok) {
    redirect("/login");
  }

  return result.data;
}
