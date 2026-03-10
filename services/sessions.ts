// services/sessions.ts
import type {
  GameSession,
  GameSessionCreatePayload,
  SessionFinishResult,
} from "@/types/session";
import api from "./api";

export type ListMySessionsParams = {
  limit?: number;
};

export async function startSession(payload: GameSessionCreatePayload = {}) {
  const { data } = await api.post<GameSession>("/sessions/start", payload);
  return data;
}

export async function finishSession(sessionId: number) {
  const { data } = await api.post<SessionFinishResult>(
    `/sessions/${sessionId}/finish`,
  );
  return data;
}

export async function getSession(sessionId: number) {
  const { data } = await api.get<GameSession>(`/sessions/${sessionId}`);
  return data;
}

export async function listMySessions(params?: ListMySessionsParams) {
  const { data } = await api.get<GameSession[]>("/sessions/", { params });
  return data;
}
