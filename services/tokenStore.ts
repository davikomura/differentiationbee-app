// services/tokenStore.ts
import * as SecureStore from "expo-secure-store";
import type { TokenPair } from "./auth";

const KEY = "auth_tokens_v1";

export async function saveTokens(tokens: TokenPair) {
  await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
}

export async function loadTokens(): Promise<TokenPair | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  return raw ? (JSON.parse(raw) as TokenPair) : null;
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(KEY);
}
