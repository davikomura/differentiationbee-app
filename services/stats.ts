import api from "./api";
import type { MyStats } from "@/types/stats";

export async function getMyStats() {
  const { data } = await api.get<MyStats>("/stats/me");
  return data;
}
