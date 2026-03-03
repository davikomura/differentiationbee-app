import api from "./api";
import type { LeaderboardEntry } from "@/types/leaderboard";

export async function getGlobalLeaderboard(limit = 5) {
  const { data } = await api.get<LeaderboardEntry[]>("/leaderboard/global", {
    params: { limit },
  });
  return data;
}
