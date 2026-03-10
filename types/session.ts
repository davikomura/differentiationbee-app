// types/session.ts
export type SessionMode = "practice" | "ranked" | (string & {});

export type GameSession = {
  id: number;
  season_id: number;
  mode: SessionMode;
  level: number | null;
  seed: number | null;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  total_questions: number;
  correct_answers: number;
};

export type GameSessionCreatePayload = {
  mode?: SessionMode;
  level?: number | null;
  seed?: number | null;
};

export type SessionTier = {
  key: string;
  min_points: number;
  max_points: number | null;
  title: string;
  description?: string | null;
};

export type SessionFinishResult = {
  session: GameSession;
  wrong_answers: number;
  result_summary: string;
  average_time_ms: number;
  time_bonus_points: number;
  delta_points: number;
  points_before: number;
  points_after: number;
  tier_before: SessionTier;
  tier_after: SessionTier;
};
