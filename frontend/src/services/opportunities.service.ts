import { fetchApi } from './api.client';

export interface UpdateOpportunityPayload {
  // Datos combinados para Asignación y Ficha
  tipoVia?: string;
  nombreVia?: string;
  numeracion?: string;
  coordenadas?: string;
  edificioEstreno?: string;
  proyecto?: string;
  tiempos?: string;
  responsable?: string;
  inspeccion?: string;
  ubicacion?: string;
  matrizHogares?: string;
  fotoFachada?: string | null;
  fotoMontante?: string | null;
  currentOwnerUserId?: string;
  companyId?: string;
}

export const opportunitiesService = {
  // Obtener todas las oportunidades (Legacy apunta a hunting)
  getAll: async () => {
    return fetchApi('/hunting/opportunities', {
      method: 'GET'
    });
  },

  // Actualizar datos del formulario en la oportunidad
  updateForms: async (id: string, payload: UpdateOpportunityPayload) => {
    return fetchApi(`/hunting/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Transición de etapa en el Kanban
  transitionStage: async (id: string, toStageIdOrCode: string, reason?: string, isValidatedByBO?: boolean, towersData?: any[]) => {
    return fetchApi(`/hunting/opportunities/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ toStageIdOrCode, reason, isValidatedByBO, towersData }),
    });
  }
};
