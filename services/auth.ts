// services/auth.ts
import api from "./api";
import type {
  LoginPayload,
  RefreshPayload,
  RegisteredUser,
  RegisterPayload,
  TokenPair,
} from "@/types/auth";

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
