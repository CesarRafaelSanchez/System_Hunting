// using native node 24 fetch
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:3000';

async function run() {
  console.log('--- INICIANDO TEST DE APROBACIÓN ASÍNCRONA ---');
  
  // 1. Login BO
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'backoffice@tudominio.com', password: 'mi_password_seguro' })
  });
  const loginData = await loginRes.json();
  const token = loginData.access_token;
  
  // 2. Fetch Opps
  const oppsRes = await fetch(`${baseUrl}/opportunities`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const opps = await oppsRes.json();
  const oppsList = Array.isArray(opps) ? opps : (opps.data || []);
  
  if (oppsList.length === 0) {
    console.log('No hay oportunidades para probar.');
    return;
  }
  
  // Agarrar la más reciente
  oppsList.sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));
  const targetOpp = oppsList[0];
  console.log(`Seleccionada Oportunidad ID: ${targetOpp.id} - Code: ${targetOpp.data.code}`);
  
  // 3. Trigger Approve
  console.log('Enviando POST /opportunities/:id/approve ...');
  const approveRes = await fetch(`${baseUrl}/opportunities/${targetOpp.id}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const approveData = await approveRes.json();
  console.log('Respuesta Approve (Esperando HTTP 202 Accepted o simulado):', approveRes.status, approveData);
  
  // 4. Wait for BullMQ to process (3-4 seconds)
  console.log('Esperando 4 segundos a que BullMQ procese el job y Python genere el Excel...');
  await new Promise(r => setTimeout(r, 4000));
  
  // 5. Verify file generated
  const expectedFile = `report_${targetOpp.data.code}.xlsx`;
  const backendDir = __dirname;
  const files = fs.readdirSync(backendDir);
  const found = files.find(f => f.startsWith(`report_${targetOpp.data.code}`) && f.endsWith('.xlsx'));
  
  if (found) {
    console.log(`[EXITO] Excel generado encontrado: ${found}`);
    console.log(`Ruta completa: ${path.join(backendDir, found)}`);
  } else {
    console.log(`[FALLO] No se encontró el archivo ${expectedFile} en ${backendDir}`);
    console.log('Archivos en backend/:', files.filter(f => f.endsWith('.xlsx')));
  }
}

run();
