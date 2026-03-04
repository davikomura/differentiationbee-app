// services/stats.ts
import type {
  MyAdvancedStats,
  MyStats,
  MyStatsEvolution,
} from "@/types/stats";
import api from "./api";

export async function getMyStats() {
  const { data } = await api.get<MyStats>("/stats/me");
  return data;
}

export async function getMyAdvancedStats() {
  const { data } = await api.get<MyAdvancedStats>("/stats/me/advanced");
  return data;
}

export async function getMyStatsEvolution(days = 30) {
  const { data } = await api.get<MyStatsEvolution>(`/stats/me/evolution?days=${days}`);
  return data;
}
