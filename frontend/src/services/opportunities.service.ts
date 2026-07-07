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
}

export const opportunitiesService = {
  // Obtener todas las oportunidades
  getAll: async () => {
    return fetchApi('/opportunities', {
      method: 'GET'
    });
  },

  // Actualizar datos del formulario en la oportunidad
  updateForms: async (id: string, payload: UpdateOpportunityPayload) => {
    return fetchApi(`/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Transición de etapa en el Kanban
  transitionStage: async (id: string, targetStage: number, reason?: string, isValidatedByBO?: boolean) => {
    // Le sumamos 1 a targetStage porque en el frontend es índice 0-19 y en DB la position es 1-20
    const position = targetStage + 1;
    return fetchApi(`/opportunities/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ toStagePosition: position, reason, isValidatedByBO }),
    });
  }
};
