import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definición genérica para guardar borradores de cualquier formulario
interface DraftState {
  [formId: string]: any;
}

interface FormStore {
  drafts: DraftState;
  saveDraft: (formId: string, data: any) => void;
  clearDraft: (formId: string) => void;
  getDraft: (formId: string) => any;
  
  // Cola de envíos pendientes (Offline Queue)
  pendingSync: Array<{ url: string; method: string; payload: any; timestamp: number }>;
  enqueueSync: (url: string, method: string, payload: any) => void;
  dequeueSync: (index: number) => void;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      drafts: {},
      saveDraft: (formId, data) => 
        set((state) => ({ drafts: { ...state.drafts, [formId]: data } })),
      clearDraft: (formId) => 
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[formId];
          return { drafts: newDrafts };
        }),
      getDraft: (formId) => get().drafts[formId] || null,

      pendingSync: [],
      enqueueSync: (url, method, payload) =>
        set((state) => ({
          pendingSync: [...state.pendingSync, { url, method, payload, timestamp: Date.now() }]
        })),
      dequeueSync: (index) =>
        set((state) => ({
          pendingSync: state.pendingSync.filter((_, i) => i !== index)
        }))
    }),
    {
      name: 'forms-offline-storage', // Guarda drafts en IndexedDB/LocalStorage
    }
  )
);
