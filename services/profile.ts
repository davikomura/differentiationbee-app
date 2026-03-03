import api from "./api";
import type { CurrentUser } from "@/types/profile";

export async function getCurrentUser() {
  const { data } = await api.get<CurrentUser>("/auth/me");
  return data;
}
