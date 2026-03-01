// services/health.ts
import api from "./api";

export type HealthResponse = {
  status?: string;
  message?: string;
  [key: string]: unknown;
};

export function getHealth() {
  return api.get<HealthResponse>("/healthz");
}
