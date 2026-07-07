import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as path from 'path';

@Injectable()
export class SheetsService {
  private readonly logger = new Logger(SheetsService.name);
  private readonly SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  async appendRow(data: any) {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE ? path.resolve(process.cwd(), '../', process.env.GOOGLE_SERVICE_ACCOUNT_FILE) : undefined,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const coordenadas = data.property?.coordenadas || '';
      const lat = coordenadas.includes(',') ? coordenadas.split(',')[0].strip() : '';
      const lng = coordenadas.includes(',') ? coordenadas.split(',')[1].strip() : '';

      const values = [
        [
          new Date().toISOString().split('T')[0], // Fecha
          data.ejecutivo || 'N/A',                // Ejecutivo
          data.property?.nombreEdificio || 'N/A', // Predio
          data.property?.direccion || 'N/A',      // Dirección
          data.property?.distrito || 'N/A',       // Distrito
          lat,                                    // Latitud
          lng                                     // Longitud
        ]
      ];

      // Simulamos que la llamada se hace (si no falla, genial, si falla en entorno mock atrapará el catch)
      const resource = { values };
      await sheets.spreadsheets.values.append({
        spreadsheetId: this.SPREADSHEET_ID,
        range: 'Hoja 1!A:G', // Asumimos la primera hoja
        valueInputOption: 'USER_ENTERED',
        requestBody: resource,
      });

      this.logger.log(`Fila inyectada exitosamente en Google Sheets (${this.SPREADSHEET_ID})`);
    } catch (error) {
      this.logger.error(`Error inyectando en Google Sheets: ${error.message}`);
      // MVP: Si falla por credenciales falsas (como será el caso sin .env real), lo capturamos
    }
  }
}
