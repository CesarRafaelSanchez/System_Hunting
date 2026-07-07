// run-mvp-tests.ts
// Script de automatización E2E para el Flujo del MVP (Etapas 4 a 7)
// Ejecución: npx ts-node scripts/run-mvp-tests.ts

const API_URL = 'http://localhost:3000';

// IDs fijos de las semillas (seeds.sql)
const SEED_DISTRITO_ID = '44444444-4444-4444-4444-444444444441'; // Santiago de Surco
const SEED_LEAD_SOURCE_ID = '55555555-5555-5555-5555-555555555555';
const SEED_PIPELINE_ID = '66666666-6666-6666-6666-666666666666';
const SEED_STAGE_LEVANTAMIENTO = '77777777-7777-7777-7777-777777777773';

async function fetchApi(endpoint: string, method: string, body?: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`[${method} ${endpoint}] Falló con status ${response.status}: ${JSON.stringify(responseData)}`);
  }

  return responseData;
}

async function runTests() {
  console.log('======================================================');
  console.log('🚀 INICIANDO AUTOMATIZACIÓN E2E DEL MVP (HUNTING CRM)');
  console.log('======================================================\n');

  try {
    // 1. Login
    console.log('1️⃣ Ejecutando POST /auth/login...');
    const loginRes = await fetchApi('/auth/login', 'POST', {
      email: 'hunter@tudominio.com',
      password: 'mi_password_seguro',
    });
    const token = loginRes.access_token;
    console.log(`   ✅ Login exitoso. Token obtenido.\n`);

    // 2. Crear Predio
    console.log('2️⃣ Ejecutando POST /predios...');
    const predioRes = await fetchApi('/predios', 'POST', {
      nombreProyecto: `Condominio Test Auto ${Date.now()}`,
      tipoDesarrollo: 'Nuevo Predio',
      origenProspeccion: 'Ruta Libre',
      clasificacionProyecto: 'Condominio',
      estadoConstruccion: 'Moderno',
      juntaDirectiva: 'Si',
      distritoId: SEED_DISTRITO_ID,
      tipoVia: 'Avenida',
      nombreVia: 'Los Patriotas',
      numeracionMunicipal: '1234',
      torresEstructura: [{ nombreTorre: 'Torre A', totalPisos: 5, hogaresPorPiso: 4 }]
    }, token);
    const predioId = predioRes.id;
    console.log(`   ✅ Predio creado exitosamente. ID: ${predioId}\n`);

    // 3. Crear Oportunidad
    console.log('3️⃣ Ejecutando POST /opportunities...');
    const oppRes = await fetchApi('/opportunities', 'POST', {
      propertyId: predioId,
      leadSourceId: SEED_LEAD_SOURCE_ID,
      pipelineId: SEED_PIPELINE_ID,
      priority: 'HIGH',
      canalHunting: 'FUTURA'
    }, token);
    const oppId = oppRes.id;
    console.log(`   ✅ Oportunidad creada. ID: ${oppId} (Status: ${oppRes.status})\n`);

    // 4. Transición de Etapa (PATCH)
    console.log('4️⃣ Ejecutando PATCH /opportunities/:id/stage...');
    await fetchApi(`/opportunities/${oppId}/stage`, 'PATCH', {
      toStageId: SEED_STAGE_LEVANTAMIENTO,
      reason: 'Automatización E2E: Salto a Levantamiento'
    }, token);
    console.log(`   ✅ Oportunidad transicionada a Levantamiento Técnico.\n`);

    // 5. Simular Subida Multimedia
    console.log('5️⃣ Ejecutando POST /media/upload...');
    const mediaRes = await fetchApi('/media/upload', 'POST', {
      entityType: 'PROPERTY',
      entityId: predioId,
      fileName: 'foto_fachada_auto.jpg',
      mimeType: 'image/jpeg',
      mediaType: 'IMAGE',
      category: 'FACHADA',
      latitude: -12.123456,
      longitude: -77.123456
    }, token);
    const mediaId = mediaRes.id;
    console.log(`   ✅ Archivo multimedia simulado. ID: ${mediaId}\n`);

    // 6. Crear Ficha Técnica
    console.log('6️⃣ Ejecutando POST /technical-records...');
    const techRes = await fetchApi('/technical-records', 'POST', {
      opportunityId: oppId,
      propertyId: predioId,
      facadeDescription: 'Fachada E2E Automática',
      mountingDescription: 'Montantes libres',
      powerAvailability: 'Sí',
      technicalFeasibility: 'Factible',
      comments: 'Viable para despliegue WIN'
    }, token);
    const techId = techRes.id;
    console.log(`   ✅ Ficha Técnica registrada. ID: ${techId}\n`);

    // 7. Reportar Incidente
    console.log('7️⃣ Ejecutando POST /incidents...');
    const incRes = await fetchApi('/incidents', 'POST', {
      opportunityId: oppId,
      propertyId: predioId,
      incidentType: 'ACCESO_DENEGADO',
      severity: 'HIGH',
      description: 'El conserje no permitió el paso durante la automatización.'
    }, token);
    const incidentId = incRes.id;
    console.log(`   ✅ Incidente reportado. ID: ${incidentId}\n`);

    // 8. Actualizar Bitácora del Incidente
    console.log('8️⃣ Ejecutando POST /incidents/:id/updates...');
    await fetchApi(`/incidents/${incidentId}/updates`, 'POST', {
      comment: 'Se programó reunión con la directiva (Automático)',
      nextAction: 'Reunión Presencial',
      nextFollowUpDate: '2026-07-15'
    }, token);
    console.log(`   ✅ Bitácora de incidente actualizada.\n`);

    console.log('🎉 ¡TODAS LAS PRUEBAS E2E PASARON CORRECTAMENTE! 🎉');
    console.log('El backend soporta el flujo operativo completo desde el Login hasta el Incidente.');

  } catch (error) {
    console.error('\n❌ ERROR EN LA AUTOMATIZACIÓN ❌');
    console.error(error.message);
    process.exit(1);
  }
}

runTests();
