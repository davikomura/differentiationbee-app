import { apiRequest } from '@/services/api';

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponseShape = {
  access_token?: string;
  token?: string;
  data?: {
    access_token?: string;
    token?: string;
  };
};

export async function login(payload: LoginPayload): Promise<string> {
  const response = await apiRequest<LoginResponseShape>('/auth/login', {
    method: 'POST',
    body: payload,
  });

  const token =
    response.access_token ?? response.token ?? response.data?.access_token ?? response.data?.token;

  if (!token) {
    throw new Error('Login succeeded but no token was returned by the API.');
  }

  return token;
}
