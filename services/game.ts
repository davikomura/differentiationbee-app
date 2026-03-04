// services/game.ts
import type { DailyChallenge } from "@/types/game";
import api from "./api";

export async function getDailyChallenge() {
  const { data } = await api.get<DailyChallenge>("/game/daily-challenge");
  return data;
}
