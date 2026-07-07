import { fetchApi } from './api.client';

export interface LoginResponse {
  access_token: string;
}

export const AuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
};
