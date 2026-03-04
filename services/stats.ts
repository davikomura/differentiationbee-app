// services/stats.ts
import type { MyStats } from "@/types/stats";
import api from "./api";

export async function getMyStats() {
  const { data } = await api.get<MyStats>("/stats/me");
  return data;
}
