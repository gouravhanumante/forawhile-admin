import { apiClient } from './client';

export interface AuthUser {
  id: string;
  phone: string;
  email: string | null;
  roles: string[];
  status: string;
}

export interface AuthTokensResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authApi = {
  login: (phone: string, password: string): Promise<AuthTokensResponse> =>
    apiClient.post('/auth/admin/login', { phone, password }),
  logout: (refreshToken: string): Promise<{ message: string }> => apiClient.post('/auth/logout', { refreshToken }),
};
