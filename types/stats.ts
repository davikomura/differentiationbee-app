// types/stats.ts
export type MyStats = {
  total_sessions: number;
  total_attempts: number;
  correct_attempts: number;
  accuracy_pct: number;
  total_score: number;
  best_score: number;
  average_time_ms: number;
};

export type AverageTimeMsByLevel = {
  level: number;
  attempts: number;
  average_time_ms: number;
};

export type MyAdvancedStats = MyStats & {
  current_streak_days: number;
  best_streak_days: number;
  average_time_ms_by_level: AverageTimeMsByLevel[];
};

export type StatsEvolutionPoint = {
  date: string;
  attempts: number;
  correct_attempts: number;
  accuracy_pct: number;
  total_score: number;
};

export type MyStatsEvolution = {
  days: number;
  points: StatsEvolutionPoint[];
};
