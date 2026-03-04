// services/leaderboard.ts
import type {
  LeaderboardEntry,
  LeaderboardPage,
  SeasonLeaderboardEntry,
} from "@/types/leaderboard";
import api from "./api";

export type GlobalLeaderboardParams = {
  page?: number;
  limit?: number;
};

export type SeasonLeaderboardParams = {
  limit?: number;
};

export async function getGlobalLeaderboard(params?: GlobalLeaderboardParams) {
  const { data } = await api.get<LeaderboardPage<LeaderboardEntry>>(
    "/leaderboard/global",
    { params },
  );
  return data;
}

export async function getGlobalLeaderboardByTier(
  tierKey: string,
  params?: GlobalLeaderboardParams,
) {
  const { data } = await api.get<LeaderboardPage<LeaderboardEntry>>(
    `/leaderboard/global/tier/${encodeURIComponent(tierKey)}`,
    { params },
  );
  return data;
}

export async function getActiveSeasonLeaderboard(params?: SeasonLeaderboardParams) {
  const { data } = await api.get<SeasonLeaderboardEntry[]>(
    "/leaderboard/season/active",
    { params },
  );
  return data;
}

export async function getSeasonLeaderboard(
  seasonId: number,
  params?: SeasonLeaderboardParams,
) {
  const { data } = await api.get<SeasonLeaderboardEntry[]>(
    `/leaderboard/season/${seasonId}`,
    { params },
  );
  return data;
}
