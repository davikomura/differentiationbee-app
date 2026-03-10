// hooks/useSessions.ts
import {
  finishSession,
  getSession,
  listMySessions,
  startSession,
  type ListMySessionsParams,
} from "@/services/sessions";
import type { GameSessionCreatePayload } from "@/types/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const sessionsQueryKeys = {
  all: ["sessions"] as const,
  list: (params?: ListMySessionsParams) =>
    [...sessionsQueryKeys.all, "list", params ?? {}] as const,
  detail: (sessionId: number) =>
    [...sessionsQueryKeys.all, "detail", sessionId] as const,
};

export function useMySessions(params?: ListMySessionsParams) {
  return useQuery({
    queryKey: sessionsQueryKeys.list(params),
    queryFn: () => listMySessions(params),
  });
}

export function useSession(sessionId: number | null | undefined) {
  return useQuery({
    queryKey: sessionsQueryKeys.detail(sessionId ?? 0),
    queryFn: () => getSession(sessionId as number),
    enabled: typeof sessionId === "number",
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: GameSessionCreatePayload) => startSession(payload),
    onSuccess: (session) => {
      void queryClient.invalidateQueries({ queryKey: sessionsQueryKeys.all });
      queryClient.setQueryData(sessionsQueryKeys.detail(session.id), session);
    },
  });
}

export function useFinishSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => finishSession(sessionId),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: sessionsQueryKeys.all });
      queryClient.setQueryData(
        sessionsQueryKeys.detail(result.session.id),
        result.session,
      );
    },
  });
}
