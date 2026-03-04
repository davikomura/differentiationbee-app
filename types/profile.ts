// types/profile.ts
export type Tier = {
  key: string;
  min_points: number;
  max_points: number | null;
  title: string;
  description?: string | null;
};

export type CurrentUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  points: number;
  tier: Tier | null;
  created_at: string;
};
