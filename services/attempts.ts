// services/attempts.ts
import type { AttemptPayload, AttemptResult } from "@/types/game";
import api from "./api";

export async function createAttempt(payload: AttemptPayload) {
  const { data } = await api.post<AttemptResult>("/attempts/", payload);
  return data;
}
