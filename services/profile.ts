// services/profile.ts
import type { CurrentUser } from "@/types/profile";
import api from "./api";

export async function getCurrentUser() {
  const { data } = await api.get<CurrentUser>("/auth/me");
  return data;
}
