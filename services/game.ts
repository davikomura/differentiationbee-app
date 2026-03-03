import api from "./api";
import type { DailyChallenge } from "@/types/game";

export async function getDailyChallenge() {
  const { data } = await api.get<DailyChallenge>("/game/daily-challenge");
  return data;
}
