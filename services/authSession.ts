// services/authSession.ts
import api, { clearAuthToken, setAuthToken } from "./api";
import { loginWithTokens, logout, refreshToken, type TokenPair } from "./auth";
import { clearTokens, loadTokens, saveTokens } from "./tokenStore";

let isRefreshing = false;
let refreshPromise: Promise<TokenPair> | null = null;

export async function bootstrapAuth() {
  const tokens = await loadTokens();
  if (tokens?.access_token) setAuthToken(tokens.access_token);
  return tokens;
}

export async function signIn(username: string, password: string) {
  const tokens = await loginWithTokens({ username, password });
  await saveTokens(tokens);
  setAuthToken(tokens.access_token);
  return tokens;
}

export async function signOut() {
  const tokens = await loadTokens();
  try {
    if (tokens?.refresh_token) {
      await logout({ refresh_token: tokens.refresh_token });
    }
  } finally {
    await clearTokens();
    clearAuthToken();
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;

    if (!error?.response || error.response.status !== 401 || !original) {
      return Promise.reject(error);
    }

    if (original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    const stored = await loadTokens();
    if (!stored?.refresh_token) {
      await clearTokens();
      clearAuthToken();
      return Promise.reject(error);
    }

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken({ refresh_token: stored.refresh_token })
        .then(async (newTokens) => {
          await saveTokens(newTokens);
          setAuthToken(newTokens.access_token);
          return newTokens;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    try {
      await refreshPromise;
      return api(original);
    } catch (e) {
      await clearTokens();
      clearAuthToken();
      return Promise.reject(e);
    }
  },
);
