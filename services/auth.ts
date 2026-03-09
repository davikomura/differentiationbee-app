// services/auth.ts
import api from "./api";

type LoginPayload = {
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

type RefreshPayload = {
  refresh_token: string;
};

export async function loginWithTokens(
  payload: LoginPayload,
): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/auth/login", payload);
  return data;
}

export async function register(
  payload: RegisterPayload,
): Promise<RegisteredUser> {
  const { data } = await api.post<RegisteredUser>("/auth/register", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<string> {
  const { access_token } = await loginWithTokens(payload);

  if (!access_token) {
    throw new Error("Login succeeded but no token was returned by the API.");
  }

  return access_token;
}

export async function refreshToken(
  payload: RefreshPayload,
): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/auth/refresh", payload);
  return data;
}

export async function logout(payload: RefreshPayload) {
  return api.post("/auth/logout", payload);
}

export async function getMe() {
  return api.get("/auth/me");
}
