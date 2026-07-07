import { fetchApi } from './api.client';

export interface CreatePredioPayload {
  ejecutivo: string;
  nombreEdificio: string;
  direccion: string;
  distrito: string;
  numeroHPs: number;
  resultadoVisita: string;
  detalle: string;
}

export const prediosService = {
  createPredio: async (payload: CreatePredioPayload) => {
    // Para simplificar MVP se envía al endpoint y se asume que
    // el backend procesará el registro y desencadenará la oportunidad inicial.
    return fetchApi('/predios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
