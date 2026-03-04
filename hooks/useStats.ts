// hooks/useStats.ts
import {
  getMyAdvancedStats,
  getMyStats,
  getMyStatsEvolution,
} from "@/services/stats";
import { useQuery } from "@tanstack/react-query";

export const statsQueryKeys = {
  all: ["stats"] as const,
  me: () => [...statsQueryKeys.all, "me"] as const,
  meAdvanced: () => [...statsQueryKeys.all, "me", "advanced"] as const,
  meEvolution: (days: number) =>
    [...statsQueryKeys.all, "me", "evolution", days] as const,
};

export function useMyStats() {
  return useQuery({
    queryKey: statsQueryKeys.me(),
    queryFn: () => getMyStats(),
  });
}

export function useMyAdvancedStats() {
  return useQuery({
    queryKey: statsQueryKeys.meAdvanced(),
    queryFn: () => getMyAdvancedStats(),
  });
}

export function useMyStatsEvolution(days = 30) {
  return useQuery({
    queryKey: statsQueryKeys.meEvolution(days),
    queryFn: () => getMyStatsEvolution(days),
  });
}
