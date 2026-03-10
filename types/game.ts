import type { SessionFinishResult } from "@/types/session";

// types/game.ts
export type DailyChallenge = {
  challenge_date: string;
  level: number;
  expression_str: string;
  expression_latex?: string | null;
};

export type IssueQuestionPayload = {
  session_id: number;
  level?: number | null;
};

export type IssuedQuestion = {
  question_id: number;
  session_id: number;
  level: number;
  expression_str: string;
  expression_latex?: string | null;
  issued_at: string;
  time_limit_ms: number;
};

export type AttemptPayload = {
  question_id: number;
  user_answer: string;
  use_latex?: boolean;
  time_taken_ms: number;
};

export type Attempt = {
  id: number;
  session_id: number;
  level: number;
  expression_latex?: string | null;
  is_correct: boolean;
  score: number;
  time_taken_ms: number;
  created_at: string;
};

export type AttemptResult = {
  attempt: Attempt;
  correct_derivative_latex: string;
  session_finish?: SessionFinishResult | null;
};
