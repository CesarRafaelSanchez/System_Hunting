import { fetchApi } from './api.client';

export interface CheckInResponse {
  id: string;
  status: string;
}

export const AttendanceService = {
  // Función utilitaria para obtener coordenadas nativas (Promesa)
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no está soportada por el navegador.'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  },

  async checkIn(): Promise<CheckInResponse> {
    try {
      const position = await this.getCurrentPosition();
      
      const payload = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        photoMediaId: '00000000-0000-0000-0000-000000000000' // ID Dummy inyectado en seeds.sql (Etapa 4/5)
      };

      const response = await fetchApi<CheckInResponse>('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      return response;
    } catch (error: any) {
      // Diferenciar error de GPS vs error de API
      if (error instanceof GeolocationPositionError) {
        throw new Error(`Error de GPS: ${error.message}. Por favor habilita los permisos de ubicación.`);
      }
      throw error;
    }
  }
};
