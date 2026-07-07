import { EmailService } from './src/dispatch/email.service';
import { SheetsService } from './src/dispatch/sheets.service';
import * as path from 'path';

async function test() {
  console.log('Testing Email & Sheets directly');
  
  const payload = {
    opportunityId: 'OPP-013451',
    property: {
      nombreEdificio: 'TEST NOVACORE API',
      distrito: 'San Isidro',
      direccion: 'Av. Test 123'
    },
    canalHunting: 'NOVACORE'
  };
  
  const excelPath = path.resolve(__dirname, 'report_OPP_OPP-013451.xlsx');
  
  console.log('--- TEST EMAIL ---');
  const emailService = new EmailService();
  try {
    await emailService.sendReportEmail(payload, excelPath);
    console.log('[+] Email enviado correctamente');
  } catch(e) {
    console.error('[-] Error Email:', e);
  }
  
  console.log('--- TEST GOOGLE SHEETS ---');
  const sheetsService = new SheetsService();
  try {
    await sheetsService.appendRow(payload);
    console.log('[+] Row añadida a Google Sheets correctamente');
  } catch(e) {
    console.error('[-] Error Sheets:', e);
  }
}

test();
