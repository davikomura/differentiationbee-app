// hooks/useLeaderboard.ts
import {
  getActiveSeasonLeaderboard,
  getGlobalLeaderboard,
  getGlobalLeaderboardByTier,
  getSeasonLeaderboard,
  type GlobalLeaderboardParams,
  type SeasonLeaderboardParams,
} from "@/services/leaderboard";
import { useQuery } from "@tanstack/react-query";

export const leaderboardQueryKeys = {
  all: ["leaderboard"] as const,
  global: (params?: GlobalLeaderboardParams) =>
    [...leaderboardQueryKeys.all, "global", params ?? {}] as const,
  globalByTier: (tierKey: string, params?: GlobalLeaderboardParams) =>
    [
      ...leaderboardQueryKeys.all,
      "global-tier",
      tierKey,
      params ?? {},
    ] as const,
  activeSeason: (params?: SeasonLeaderboardParams) =>
    [...leaderboardQueryKeys.all, "active-season", params ?? {}] as const,
  season: (seasonId: number, params?: SeasonLeaderboardParams) =>
    [...leaderboardQueryKeys.all, "season", seasonId, params ?? {}] as const,
};

export function useGlobalLeaderboard(params?: GlobalLeaderboardParams) {
  return useQuery({
    queryKey: leaderboardQueryKeys.global(params),
    queryFn: () => getGlobalLeaderboard(params),
  });
}

export function useGlobalLeaderboardByTier(
  tierKey: string,
  params?: GlobalLeaderboardParams,
) {
  return useQuery({
    queryKey: leaderboardQueryKeys.globalByTier(tierKey, params),
    queryFn: () => getGlobalLeaderboardByTier(tierKey, params),
    enabled: Boolean(tierKey),
  });
}

export function useActiveSeasonLeaderboard(params?: SeasonLeaderboardParams) {
  return useQuery({
    queryKey: leaderboardQueryKeys.activeSeason(params),
    queryFn: () => getActiveSeasonLeaderboard(params),
  });
}

export function useSeasonLeaderboard(
  seasonId: number | null | undefined,
  params?: SeasonLeaderboardParams,
) {
  return useQuery({
    queryKey: leaderboardQueryKeys.season(seasonId ?? 0, params),
    queryFn: () => getSeasonLeaderboard(seasonId as number, params),
    enabled: typeof seasonId === "number",
  });
}
