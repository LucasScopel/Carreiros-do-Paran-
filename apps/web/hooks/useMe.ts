"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

async function getMe() {
  const result = await api.users.me();

  if (!result.ok) {
    if (result.error.code === "UNAUTHORIZED") {
      return null;
    }

    throw new Error(result.error.message);
  }

  return result;
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
}
