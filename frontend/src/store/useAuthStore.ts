import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: 'HUNTER' | 'BACKOFFICE' | 'ADMIN';
  companyId: string;
}

interface AuthState {
  token: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
  originalToken: string | null;
  originalUser: UserData | null;
  login: (token: string, user: UserData) => void;
  logout: () => void;
  impersonate: (token: string, user: UserData) => void;
  restoreImpersonation: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      originalToken: null,
      originalUser: null,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false, originalToken: null, originalUser: null }),
      impersonate: (token, user) => set((state) => ({ 
        originalToken: state.token, 
        originalUser: state.user,
        token, 
        user 
      })),
      restoreImpersonation: () => set((state) => ({
        token: state.originalToken,
        user: state.originalUser,
        originalToken: null,
        originalUser: null
      })),
    }),
    {
      name: 'auth-storage', // Clave en localStorage
    }
  )
);
