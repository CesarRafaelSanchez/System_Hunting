-- ============================================================================
-- SCRIPT DDL SQL - CRM HUNTING (POSTGRESQL)
-- ============================================================================
-- Descripción: Definición física de la base de datos para el MVP del CRM.
-- Incluye la creación de las 33 tablas base, llaves primarias, llaves foráneas,
-- restricciones CHECK, índices de alto rendimiento y el trigger de auditoría.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CAPA DE SEGURIDAD Y MULTIEMPRESA
-- ============================================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    ruc VARCHAR(20) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(120) NOT NULL UNIQUE,
    module VARCHAR(80) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone VARCHAR(30) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    supervisor_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    last_login_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uniq_user_role UNIQUE (user_id, role_id)
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uniq_role_permission UNIQUE (role_id, permission_id)
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. CAPA DE ENTORNO OPERATIVO Y SOPORTE
-- ============================================================================

CREATE TABLE lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    code VARCHAR(80) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE distritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================================================
-- 3. CAPA DE MODELADO DEL PREDIO (NÚCLEO TÉCNICO)
-- ============================================================================

CREATE TABLE predios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    nombre_proyecto TEXT NOT NULL,
    tipo_desarrollo VARCHAR(80) NOT NULL CONSTRAINT chk_tipo_desarrollo CHECK (tipo_desarrollo IN ('Nuevo Predio', 'Ampliación de Torre')),
    origen_prospeccion VARCHAR(80) NOT NULL,
    clasificacion_proyecto VARCHAR(80) NOT NULL CONSTRAINT chk_clasificacion CHECK (clasificacion_proyecto IN ('Edificio', 'Condominio')),
    estado_construccion VARCHAR(80) NOT NULL CONSTRAINT chk_estado_const CHECK (estado_construccion IN ('Estreno', 'Moderno', 'Antiguo')),
    fecha_entrega DATE NULL,
    termino_montantes DATE NULL,
    termino_fibra_optica DATE NULL,
    junta_directiva VARCHAR(10) NOT NULL CONSTRAINT chk_junta CHECK (junta_directiva IN ('Si', 'No')),
    fecha_visita_tecnica DATE NULL,
    horario_visita VARCHAR(30) NULL CONSTRAINT chk_horario CHECK (horario_visita IN ('9 AM a 12 AM', '1 PM A 4 PM')),
    departamento VARCHAR(100) NOT NULL DEFAULT 'Lima',
    provincia VARCHAR(100) NOT NULL DEFAULT 'Lima',
    distrito_id UUID NOT NULL REFERENCES distritos(id) ON DELETE RESTRICT,
    urbanizacion_zona TEXT NULL,
    codigo_postal VARCHAR(30) NULL,
    tipo_via VARCHAR(50) NOT NULL CONSTRAINT chk_tipo_via CHECK (tipo_via IN ('Avenida', 'Calle', 'Jirón', 'Pasaje')),
    nombre_via TEXT NOT NULL,
    numeracion_municipal VARCHAR(50) NOT NULL,
    coordenadas_gps POINT NULL,
    total_torres INTEGER NOT NULL DEFAULT 1 CONSTRAINT chk_total_torres CHECK (total_torres >= 1),
    total_hogares INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_total_hogares CHECK (total_hogares >= 0),
    clientes_interesados INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_clientes CHECK (clientes_interesados >= 0),
    hunter_principal_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL
);

-- Torres y Pisos: Sin eliminación lógica. ON DELETE CASCADE habilitado.
CREATE TABLE torres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    predio_id UUID NOT NULL REFERENCES predios(id) ON DELETE CASCADE,
    nombre_torre TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    torre_id UUID NOT NULL REFERENCES torres(id) ON DELETE CASCADE,
    numero_piso INTEGER NOT NULL CONSTRAINT chk_num_piso CHECK (numero_piso >= 1),
    hogares_cantidad INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_hogares_cant CHECK (hogares_cantidad >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. CAPA DE CONTACTOS Y ASOCIACIONES
-- ============================================================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NULL,
    email VARCHAR(150) NULL,
    document_type VARCHAR(30) NULL,
    document_number VARCHAR(30) NULL,
    contact_type VARCHAR(80) NOT NULL CONSTRAINT chk_contact_type CHECK (contact_type IN ('ADMINISTRADOR', 'PRESIDENTE_JD', 'PROPIETARIO', 'REPRESENTANTE', 'EJECUTIVO', 'CONTACTO_TECNICO', 'OTRO')),
    created_by_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE property_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES predios(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    relationship_type VARCHAR(80) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uniq_property_contact UNIQUE (property_id, contact_id)
);

-- ============================================================================
-- 5. CAPA COMERCIAL Y PIPELINE (FLUJO FLEXIBLE)
-- ============================================================================

CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    code VARCHAR(80) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL,
    stage_type VARCHAR(50) NOT NULL CONSTRAINT chk_stage_type CHECK (stage_type IN ('normal', 'incident', 'won', 'lost')),
    is_initial BOOLEAN NOT NULL DEFAULT FALSE,
    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    is_won BOOLEAN NOT NULL DEFAULT FALSE,
    is_lost BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    property_id UUID NOT NULL REFERENCES predios(id) ON DELETE CASCADE,
    lead_source_id UUID NOT NULL REFERENCES lead_sources(id) ON DELETE RESTRICT,
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE RESTRICT,
    current_stage_id UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
    current_owner_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL CONSTRAINT chk_opp_status CHECK (status IN ('OPEN', 'WON', 'LOST', 'PAUSED', 'CANCELLED', 'DUPLICATED')),
    priority VARCHAR(30) NULL CONSTRAINT chk_opp_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    canal_hunting VARCHAR(50) NOT NULL CONSTRAINT chk_canal_hunting CHECK (canal_hunting IN ('FUTURA', 'NOVACORE', 'REFERIDO')),
    motivo_cierre TEXT NULL,
    current_stage_entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_activity_at TIMESTAMPTZ NULL,
    won_at TIMESTAMPTZ NULL,
    lost_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL
);

-- Pipeline Relajado: Tabla para registrar transiciones libres de etapas
CREATE TABLE opportunity_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    from_stage_id UUID NULL REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
    to_stage_id UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
    changed_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE opportunity_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    unassigned_at TIMESTAMPTZ NULL,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    reason TEXT NULL
);

-- ============================================================================
-- 6. CAPA DE FORMULARIOS CORE E INGESTA
-- ============================================================================

CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    field_name VARCHAR(120) NOT NULL,
    field_label VARCHAR(180) NOT NULL,
    field_type VARCHAR(50) NOT NULL CONSTRAINT chk_field_type CHECK (field_type IN ('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'TEXTAREA', 'LOCATION', 'IMAGE', 'FILE')),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    options_json JSONB NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE RESTRICT,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    opportunity_id UUID NULL REFERENCES opportunities(id) ON DELETE SET NULL,
    property_id UUID NULL REFERENCES predios(id) ON DELETE SET NULL,
    submitted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL CONSTRAINT chk_submission_status CHECK (status IN ('SUBMITTED', 'PROCESSED', 'OBSERVED', 'REJECTED', 'CORRECTED')),
    raw_payload_json JSONB NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE form_submission_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
    value_text TEXT NULL,
    value_number NUMERIC(12,2) NULL,
    value_boolean BOOLEAN NULL,
    value_date DATE NULL,
    value_json JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 7. CAPA DE LEVANTAMIENTOS, SOLICITUDES E INCIDENTES
-- ============================================================================

CREATE TABLE assignment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CONSTRAINT chk_req_type CHECK (request_type IN ('ASSIGNMENT', 'REASSIGNMENT')),
    status VARCHAR(50) NOT NULL CONSTRAINT chk_req_status CHECK (status IN ('DRAFT', 'VALIDATING_BACKOFFICE', 'OBSERVED', 'SENT_TO_WIN', 'WAITING_RESPONSE', 'APPROVED', 'REJECTED', 'CANCELLED')),
    requested_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    validated_by_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    sent_by_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    sent_at TIMESTAMPTZ NULL,
    win_response_status VARCHAR(50) NULL CONSTRAINT chk_win_status CHECK (win_response_status IN ('PENDING', 'APPROVED', 'REJECTED', 'OBSERVED', 'NO_RESPONSE')),
    win_response_date TIMESTAMPTZ NULL,
    win_response_detail TEXT NULL,
    rejection_reason TEXT NULL,
    is_recoverable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE technical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES predios(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CONSTRAINT chk_tech_status CHECK (status IN ('PENDING', 'COMPLETED', 'VALIDATING', 'OBSERVED', 'APPROVED', 'SENT_TO_WIN')),
    completed_by_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    validated_by_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    sent_to_win_by_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMPTZ NULL,
    sent_to_win_at TIMESTAMPTZ NULL,
    observations TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE technical_record_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technical_record_id UUID NOT NULL REFERENCES technical_records(id) ON DELETE CASCADE,
    facade_description TEXT NULL,
    mounting_description TEXT NULL,
    access_description TEXT NULL,
    internal_route_description TEXT NULL,
    external_route_description TEXT NULL,
    power_availability VARCHAR(50) NULL,
    technical_feasibility VARCHAR(50) NULL,
    comments TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES predios(id) ON DELETE CASCADE,
    incident_type VARCHAR(80) NOT NULL,
    status VARCHAR(50) NOT NULL CONSTRAINT chk_inc_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESCHEDULED', 'RESOLVED', 'IRREVERSIBLE', 'CLOSED_LOST')),
    severity VARCHAR(30) NOT NULL CONSTRAINT chk_inc_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    reported_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    resolution_detail TEXT NULL,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE incident_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    comment TEXT NOT NULL,
    next_action TEXT NULL,
    next_follow_up_date DATE NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. CAPA MULTIMEDIA, ARCHIVOS Y ASISTENCIA (TIMEMARK FLEXIBLE)
-- ============================================================================

-- Media Assets: Polimórfico. URLs sustituibles a enlaces de Google Drive asíncronamente
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    entity_type VARCHAR(80) NOT NULL CONSTRAINT chk_entity_type CHECK (entity_type IN ('PROPERTY', 'TECHNICAL_RECORD', 'ATTENDANCE_EVENT', 'INCIDENT')),
    entity_id UUID NOT NULL,
    uploaded_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL, -- Inicialmente URL local raw, a los 15 días sobreescrita a URL de Google Drive
    storage_key TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NULL,
    media_type VARCHAR(50) NOT NULL CONSTRAINT chk_media_type CHECK (media_type IN ('IMAGE', 'VIDEO', 'AUDIO')),
    category VARCHAR(80) NOT NULL CONSTRAINT chk_category CHECK (category IN ('FACHADA', 'MONTANTE', 'ACCESO', 'CROQUIS', 'EVIDENCIA_VISITA', 'EVIDENCIA_BLOQUEO', 'ASISTENCIA_INICIO', 'ASISTENCIA_FIN', 'DOCUMENTO', 'OTRO')),
    latitude NUMERIC(10,7) NULL,
    longitude NUMERIC(10,7) NULL,
    taken_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID NOT NULL,
    uploaded_by_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    document_type VARCHAR(80) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL
);

-- Asistencia: Simplificada, Point coordinates, selfie URL. Sin reglas de geofencing en BD
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CONSTRAINT chk_att_status CHECK (status IN ('OPEN', 'CLOSED', 'INCOMPLETE', 'OBSERVED', 'APPROVED')),
    started_at TIMESTAMPTZ NULL,
    ended_at TIMESTAMPTZ NULL,
    start_latitude NUMERIC(10,7) NULL,
    start_longitude NUMERIC(10,7) NULL,
    end_latitude NUMERIC(10,7) NULL,
    end_longitude NUMERIC(10,7) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uniq_user_work_date UNIQUE (user_id, work_date)
);

CREATE TABLE attendance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CONSTRAINT chk_event_type CHECK (event_type IN ('CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END')),
    coordenada POINT NOT NULL,
    photo_media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 9. CAPA DE SEGUIMIENTO DIARIO, CONFIGURACIÓN Y AUDITORÍA
-- ============================================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    opportunity_id UUID NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    assigned_to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(180) NOT NULL,
    description TEXT NULL,
    status VARCHAR(50) NOT NULL CONSTRAINT chk_task_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    priority VARCHAR(30) NULL CONSTRAINT chk_task_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    due_date TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE configuracion_sistema (
    clave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    descripcion TEXT NULL
);

-- Activity Logs: Almacena los deltas forenses inmutables.
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NULL REFERENCES companies(id) ON DELETE SET NULL,
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(120) NOT NULL,
    old_values_json JSONB NULL,
    new_values_json JSONB NULL,
    ip_address VARCHAR(80) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 10. ÍNDICES DE RENDIMIENTO (ALTA FRECUENCIA Y GEOMÉTRICOS)
-- ============================================================================

-- B-Tree Índices Básicos
CREATE INDEX idx_predios_company ON predios(company_id);
CREATE INDEX idx_predios_distrito ON predios(distrito_id);
CREATE INDEX idx_predios_hunter ON predios(hunter_principal_id);
CREATE INDEX idx_torres_predio ON torres(predio_id);
CREATE INDEX idx_pisos_torre ON pisos(torre_id);
CREATE INDEX idx_pisos_hogares_cant ON pisos(hogares_cantidad);

CREATE INDEX idx_opportunities_company ON opportunities(company_id);
CREATE INDEX idx_opportunities_property ON opportunities(property_id);
CREATE INDEX idx_opportunities_stage ON opportunities(current_stage_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);

CREATE INDEX idx_media_assets_polymorphic ON media_assets(entity_type, entity_id);
CREATE INDEX idx_documents_polymorphic ON documents(entity_type, entity_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- GiST Índices para Coordenadas Geográficas (POINT)
CREATE INDEX idx_predios_coordenadas_gps ON predios USING gist(coordenadas_gps);
CREATE INDEX idx_attendance_events_coordenada ON attendance_events USING gist(coordenada);

-- ============================================================================
-- 11. TRIGGER FORENSE DE AUDITORÍA PL/pgSQL
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
    v_old JSONB := NULL;
    v_new JSONB := NULL;
    v_action VARCHAR(50);
BEGIN
    -- Captura segura de la variable de sesión inyectada por el API
    BEGIN
        v_user_id := NULLIF(current_setting('crm.current_user_id', true), '')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL; -- Fallback si la variable no está seteada o tiene formato incorrecto
    END;

    -- Determinar la acción y serializar payloads
    IF (TG_OP = 'UPDATE') THEN
        v_action := 'UPDATE_' || UPPER(TG_TABLE_NAME);
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
        
        IF (v_old ? 'company_id') THEN
            v_company_id := (v_old->>'company_id')::UUID;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        v_action := 'DELETE_' || UPPER(TG_TABLE_NAME);
        v_old := to_jsonb(OLD);
        
        IF (v_old ? 'company_id') THEN
            v_company_id := (v_old->>'company_id')::UUID;
        END IF;
    END IF;

    -- Inyección del registro delta inmutable en logs
    INSERT INTO activity_logs (
        id,
        company_id,
        user_id,
        entity_type,
        entity_id,
        action,
        old_values_json,
        new_values_json,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_company_id,
        v_user_id,
        UPPER(TG_TABLE_NAME),
        (COALESCE(v_new->>'id', v_old->>'id'))::UUID,
        v_action,
        v_old,
        v_new,
        now()
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Vinculación de triggers a tablas principales de la operación
CREATE TRIGGER tr_audit_predios
AFTER UPDATE OR DELETE ON predios
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER tr_audit_opportunities
AFTER UPDATE OR DELETE ON opportunities
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER tr_audit_contacts
AFTER UPDATE OR DELETE ON contacts
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
