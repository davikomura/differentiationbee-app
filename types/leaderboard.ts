// types/leaderboard.ts
export type LeaderboardEntry = {
  rank: number;
  user_id: number;
  username: string;
  points: number;
};

export type SeasonLeaderboardEntry = {
  rank: number;
  user_id: number;
  username: string;
  total_score: number;
  sessions_played: number;
};

export type LeaderboardPage<TItem = LeaderboardEntry> = {
  items: TItem[];
  page: number;
  limit: number;
  total: number;
};
