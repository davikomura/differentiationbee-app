// types/game.ts
export type DailyChallenge = {
  challenge_date: string;
  level: number;
  expression_str: string;
  expression_latex?: string | null;
};
