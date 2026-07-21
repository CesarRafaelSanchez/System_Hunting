import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchApi } from '../services/api.client';

export interface Workspace {
  companyId: string;
  name: string;
  slug: string;
  role: 'HUNTER' | 'BACKOFFICE' | 'ACCOUNT_ADMIN' | 'AGENCY_ADMIN' | 'AGENCY_SUPPORT';
}

interface TenantState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (workspace: Workspace) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      workspaces: [],
      activeWorkspace: null,
      isLoading: false,

      fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
          const response = await fetchApi<Workspace[]>('/users/me/workspaces');
          set({ workspaces: response, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch workspaces', error);
          set({ isLoading: false });
        }
      },

      setActiveWorkspace: (workspace) => {
        set({ activeWorkspace: workspace });
        // Sync with legacy useAuthStore state
        import('./useAuthStore').then(({ useAuthStore }) => {
          const authState = useAuthStore.getState();
          if (authState.user && authState.token) {
            useAuthStore.getState().updateUser(authState.token, {
              ...authState.user,
              role: workspace.role,
              companyId: workspace.companyId
            });
          }
          // Recargar para forzar limpieza de cachés
          window.location.reload();
        });
      },

      clearTenant: () => set({ workspaces: [], activeWorkspace: null }),
    }),
    {
      name: 'tenant-storage', // Clave en localStorage
    }
  )
);
