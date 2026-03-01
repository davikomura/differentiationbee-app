// services/api.ts
import axios from "axios";
import { Platform } from "react-native";

const envBaseURL = process.env.EXPO_PUBLIC_API_URL?.trim();
const fallbackHost = Platform.select({
  android: "10.0.2.2",
  default: "localhost",
});
const fallbackBaseURL = `http://${fallbackHost}:8000`;
const baseURL =
  envBaseURL && /^https?:\/\//i.test(envBaseURL) ? envBaseURL : fallbackBaseURL;

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete api.defaults.headers.common.Authorization;
}

export default api;
