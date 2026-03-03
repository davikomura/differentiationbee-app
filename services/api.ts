// services/api.ts
import axios from "axios";
import { Platform } from "react-native";

const envBaseURL = process.env.EXPO_PUBLIC_API_URL?.trim();

const fallbackHost = Platform.select({
  android: "192.168.10.7",
  default: "192.168.10.7",
});

const fallbackBaseURL = `http://${fallbackHost}:8000`;

const baseURL =
  envBaseURL && /^https?:\/\//i.test(envBaseURL) ? envBaseURL : fallbackBaseURL;

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete api.defaults.headers.common.Authorization;
}

export default api;
