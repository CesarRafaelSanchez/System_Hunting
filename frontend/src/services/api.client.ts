const API_BASE_URL = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(`API Error: ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let token = null;
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token = parsed.state?.token;
    }
  } catch (e) {}

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn('Acceso denegado o token expirado. Limpiando sesión...');
      import('../store/useAuthStore').then(module => {
        module.useAuthStore.getState().logout();
      });
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    
    const errorData = await response.json().catch(() => null);
    if (response.status >= 500) {
      console.error('Error interno del servidor:', errorData);
    }
    throw new ApiError(response.status, errorData);
  }

  return response.json();
}
