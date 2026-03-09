// types/auth.ts
export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type RegisteredUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type RefreshPayload = {
  refresh_token: string;
};
