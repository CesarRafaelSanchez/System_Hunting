import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompanyData {
  id: string;
  name: string;
  slug: string;
  role: string;
  tipoNegocio: 'HUNTING_EDIFICIOS' | 'VENTAS_B2B';
}

export interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  globalRole: string | null;
  companyId: string | null;
  supervisorId?: string | null;
  tipoNegocio?: 'HUNTING_EDIFICIOS' | 'VENTAS_B2B';
  companies?: CompanyData[];
}

interface AuthState {
  token: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
  activeWorkspace: CompanyData | null;
  originalToken: string | null;
  originalUser: UserData | null;
  login: (token: string, user: UserData) => void;
  logout: () => void;
  setActiveWorkspace: (workspace: CompanyData | null) => void;
  impersonate: (token: string, user: UserData) => void;
  restoreImpersonation: () => void;
  updateUser: (token: string, user: UserData) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      activeWorkspace: null,
      originalToken: null,
      originalUser: null,
      login: (token, user) => {
        const defaultCompany = user.companies?.[0] || null;
        set({
          token,
          user,
          isAuthenticated: true,
          activeWorkspace: defaultCompany,
        });
      },
      logout: () => set({
        token: null,
        user: null,
        isAuthenticated: false,
        activeWorkspace: null,
        originalToken: null,
        originalUser: null,
      }),
      setActiveWorkspace: (workspace) => set((state) => {
        if (!state.user) return {};
        // Sobrescribir el rol y companyId del usuario con los del workspace activo
        const updatedUser = {
          ...state.user,
          companyId: workspace?.id || null,
          role: workspace?.role || state.user.role,
        };
        return {
          activeWorkspace: workspace,
          user: updatedUser,
        };
      }),
      impersonate: (token, user) => set((state) => ({ 
        originalToken: state.token, 
        originalUser: state.user,
        token, 
        user,
        activeWorkspace: user.companyId ? {
          id: user.companyId,
          name: 'Suplantado',
          slug: 'impersonated',
          role: user.role,
          tipoNegocio: user.tipoNegocio || (['ASESOR_VENTAS', 'SUPERVISOR_VENTAS', 'BACKOFFICE_VENTAS', 'POSTVENTA'].includes(user.role)
            ? 'VENTAS_B2B'
            : 'HUNTING_EDIFICIOS'),
        } : null,
      })),
      restoreImpersonation: () => set((state) => {
        const originalDefaultCompany = state.originalUser?.companies?.[0] || null;
        return {
          token: state.originalToken,
          user: state.originalUser,
          activeWorkspace: originalDefaultCompany,
          originalToken: null,
          originalUser: null,
        };
      }),
      updateUser: (token, user) => set({ token, user }),
    }),
    {
      name: 'auth-storage', // Clave en localStorage
    }
  )
);
