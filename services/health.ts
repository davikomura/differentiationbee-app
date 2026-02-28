import { apiRequest } from '@/services/api';

export type HealthResponse = {
  status?: string;
  message?: string;
  [key: string]: unknown;
};

export function getHealth() {
  return apiRequest<HealthResponse>('/health');
}
