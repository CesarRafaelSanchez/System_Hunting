-- ============================================================================
-- SCRIPT DE SEEDING TRUNCATE & RE-INSERT - CRM HUNTING
-- ============================================================================

-- Limpiar datos previos para evitar conflictos de IDs cruzados
TRUNCATE pipeline_stages, pipelines, lead_sources, media_assets, distritos, user_roles, users, companies, roles CASCADE;

-- 1. Insertar Empresa de Prueba
INSERT INTO companies (id, name, slug, ruc) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Futura', 'futura', '20123456789');

-- 2. Insertar Roles del Sistema
INSERT INTO roles (id, name, description) 
VALUES 
  ('22222222-2222-2222-2222-222222222221', 'HUNTER', 'Ejecutivo comercial de campo'),
  ('22222222-2222-2222-2222-222222222222', 'BACKOFFICE', 'Personal de soporte y validación');

-- 3. Insertar Distritos con IDs fijos para pruebas
INSERT INTO distritos (id, nombre) 
VALUES 
  ('44444444-4444-4444-4444-444444444441', 'Santiago de Surco'),
  ('44444444-4444-4444-4444-444444444442', 'Miraflores'),
  ('44444444-4444-4444-4444-444444444443', 'San Isidro'),
  ('44444444-4444-4444-4444-444444444444', 'San Borja'),
  ('44444444-4444-4444-4444-444444444445', 'La Molina')
ON CONFLICT (nombre) DO NOTHING;

-- 4. Insertar Usuarios de Prueba (Password: mi_password_seguro)
INSERT INTO users (id, company_id, full_name, email, password_hash, phone) 
VALUES 
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Test Hunter', 'hunter@tudominio.com', '$2b$10$0vxlK3gTUhvSNtv1FwioBeJ/p8yRKIu4nf3R7CY3EczZ9BIk8I2V2', '987654321'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Test Backoffice', 'bo@tudominio.com', '$2b$10$0vxlK3gTUhvSNtv1FwioBeJ/p8yRKIu4nf3R7CY3EczZ9BIk8I2V2', '987654322');

-- 5. Vincular Usuarios con Roles
INSERT INTO user_roles (user_id, role_id)
VALUES 
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221'),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222');

-- 6. Insertar Media Asset de Prueba (Selfie / Foto Dummy)
INSERT INTO media_assets (id, company_id, entity_type, entity_id, uploaded_by_user_id, file_name, file_url, storage_key, mime_type, media_type, category)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'ATTENDANCE_EVENT',
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333331',
  'dummy_selfie.jpg',
  'http://localhost/dummy.jpg',
  'local/dummy.jpg',
  'image/jpeg',
  'IMAGE',
  'ASISTENCIA_INICIO'
);

-- 7. Datos de Soporte para Oportunidades
INSERT INTO lead_sources (id, name, code, description) VALUES 
('55555555-5555-5555-5555-555555555555', 'Captación en Campo', 'CAMPO', 'Prospectos hallados en ruta libre o barrido físico');

INSERT INTO pipelines (id, name, code, description) VALUES 
('66666666-6666-6666-6666-666666666666', 'Pipeline Edificios y Condominios', 'B2C_EDIFICIOS', 'Flujo principal para captación de predios residenciales');

INSERT INTO pipeline_stages (id, pipeline_id, name, code, position, stage_type, is_initial, is_final, is_won, is_lost) VALUES
('77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666666', 'Prospección', 'PROSPECCION', 1, 'normal', true, false, false, false),
('77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666666', 'Validación BackOffice', 'VALIDACION_BO', 2, 'normal', false, false, false, false),
('77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666666', 'Levantamiento Técnico', 'LEVANTAMIENTO', 3, 'normal', false, false, false, false),
('77777777-7777-7777-7777-777777777774', '66666666-6666-6666-6666-666666666666', 'Ganada', 'GANADA', 4, 'won', false, true, true, false);