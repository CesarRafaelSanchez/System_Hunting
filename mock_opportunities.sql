-- ============================================================================
-- INSERT TEST PREDIOS & OPPORTUNITIES FOR KANBAN TESTING
-- ============================================================================

-- Limpiar oportunidades y predios previos para evitar duplicados
TRUNCATE opportunities, predios CASCADE;

-- 1. Insertar Predios
INSERT INTO predios (
  id, 
  company_id, 
  nombre_proyecto, 
  tipo_desarrollo, 
  origen_prospeccion, 
  clasificacion_proyecto, 
  estado_construccion, 
  junta_directiva,
  distrito_id, 
  tipo_via, 
  nombre_via, 
  numeracion_municipal, 
  total_hogares, 
  hunter_principal_id
) VALUES 
(
  '88888888-8888-8888-8888-888888888881',
  '11111111-1111-1111-1111-111111111111',
  'Edificio Allamanda 115',
  'Nuevo Predio',
  'CAMPO',
  'Edificio',
  'Estreno',
  'No',
  '44444444-4444-4444-4444-444444444441', -- Santiago de Surco
  'Avenida',
  'Primavera',
  '115',
  80,
  '33333333-3333-3333-3333-333333333331' -- Test Hunter
),
(
  '88888888-8888-8888-8888-888888888882',
  '11111111-1111-1111-1111-111111111111',
  'Condominio Los Pinos',
  'Nuevo Predio',
  'CAMPO',
  'Condominio',
  'Moderno',
  'No',
  '44444444-4444-4444-4444-444444444442', -- Miraflores
  'Calle',
  'Larco',
  '456',
  45,
  '33333333-3333-3333-3333-333333333331' -- Test Hunter
),
(
  '88888888-8888-8888-8888-888888888883',
  '11111111-1111-1111-1111-111111111111',
  'Torre Las Flores',
  'Ampliación de Torre',
  'CAMPO',
  'Edificio',
  'Antiguo',
  'No',
  '44444444-4444-4444-4444-444444444443', -- San Isidro
  'Jirón',
  'Arequipa',
  '789',
  20,
  '33333333-3333-3333-3333-333333333332' -- Test Backoffice (asigned as executive for test)
),
(
  '88888888-8888-8888-8888-888888888884',
  '11111111-1111-1111-1111-111111111111',
  'Edificio Residencial San Borja',
  'Nuevo Predio',
  'CAMPO',
  'Edificio',
  'Moderno',
  'No',
  '44444444-4444-4444-4444-444444444444', -- San Borja
  'Calle',
  'Aviación',
  '1011',
  120,
  '33333333-3333-3333-3333-333333333331' -- Test Hunter
);

-- 2. Insertar Oportunidades
INSERT INTO opportunities (
  id,
  code,
  company_id,
  property_id,
  lead_source_id,
  pipeline_id,
  current_stage_id,
  current_owner_user_id,
  created_by_user_id,
  status,
  priority,
  canal_hunting,
  current_stage_entered_at
) VALUES 
(
  '99999999-9999-9999-9999-999999999991',
  'OPP-001',
  '11111111-1111-1111-1111-111111111111',
  '88888888-8888-8888-8888-888888888881',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777771', -- Prospección
  '33333333-3333-3333-3333-333333333331',
  '33333333-3333-3333-3333-333333333331',
  'OPEN',
  'HIGH',
  'FUTURA',
  NOW()
),
(
  '99999999-9999-9999-9999-999999999992',
  'OPP-002',
  '11111111-1111-1111-1111-111111111111',
  '88888888-8888-8888-8888-888888888882',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777772', -- Validación BackOffice
  '33333333-3333-3333-3333-333333333331',
  '33333333-3333-3333-3333-333333333331',
  'OPEN',
  'MEDIUM',
  'NOVACORE',
  NOW()
),
(
  '99999999-9999-9999-9999-999999999993',
  'OPP-003',
  '11111111-1111-1111-1111-111111111111',
  '88888888-8888-8888-8888-888888888883',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777773', -- Levantamiento Técnico
  '33333333-3333-3333-3333-333333333332',
  '33333333-3333-3333-3333-333333333332',
  'OPEN',
  'LOW',
  'REFERIDO',
  NOW()
),
(
  '99999999-9999-9999-9999-999999999994',
  'OPP-004',
  '11111111-1111-1111-1111-111111111111',
  '88888888-8888-8888-8888-888888888884',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777771', -- Prospección
  '33333333-3333-3333-3333-333333333331',
  '33333333-3333-3333-3333-333333333331',
  'OPEN',
  'URGENT',
  'NOVACORE',
  NOW()
);
