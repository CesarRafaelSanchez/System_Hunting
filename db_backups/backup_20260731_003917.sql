--
-- PostgreSQL database dump
--

\restrict DoJp0OoCEa87bLcZoZeIMIwImpFVoynnCnodxoFZxQlibrbuX2vSQbMAYvEmrWt

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    attendance_session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    event_type character varying(50) NOT NULL,
    coordenada point NOT NULL,
    photo_media_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.attendance_events OWNER TO postgres;

--
-- Name: attendance_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    work_date date NOT NULL,
    status character varying(50) NOT NULL,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    start_latitude numeric(10,7),
    start_longitude numeric(10,7),
    end_latitude numeric(10,7),
    end_longitude numeric(10,7),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.attendance_sessions OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(150) NOT NULL,
    slug character varying(80) NOT NULL,
    ruc character varying(20),
    is_active boolean DEFAULT true NOT NULL,
    tipo_negocio character varying(50) DEFAULT 'HUNTING_EDIFICIOS'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: configuracion_sistema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion_sistema (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clave character varying(100) NOT NULL,
    valor text,
    descripcion text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.configuracion_sistema OWNER TO postgres;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    full_name character varying(150) NOT NULL,
    phone character varying(30),
    email character varying(150),
    document_type character varying(30),
    document_number character varying(30),
    contact_type character varying(80) NOT NULL,
    created_by_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- Name: distritos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.distritos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.distritos OWNER TO postgres;

--
-- Name: form_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_submissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    opportunity_id uuid NOT NULL,
    form_code character varying(50) NOT NULL,
    submitted_by_user_id uuid,
    raw_payload_json jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.form_submissions OWNER TO postgres;

--
-- Name: incident_updates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incident_updates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    incident_id uuid NOT NULL,
    user_id uuid NOT NULL,
    comment text NOT NULL,
    next_action text,
    next_follow_up_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.incident_updates OWNER TO postgres;

--
-- Name: incidents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incidents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    opportunity_id uuid NOT NULL,
    property_id uuid NOT NULL,
    incident_type character varying(80) NOT NULL,
    status character varying(50) DEFAULT 'OPEN'::character varying NOT NULL,
    severity character varying(30) NOT NULL,
    reported_by_user_id uuid NOT NULL,
    assigned_to_user_id uuid,
    description text NOT NULL,
    resolution_detail text,
    reported_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.incidents OWNER TO postgres;

--
-- Name: lead_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_sources (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(120) NOT NULL,
    code character varying(80) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lead_sources OWNER TO postgres;

--
-- Name: media_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_assets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    entity_type character varying(80) NOT NULL,
    entity_id uuid NOT NULL,
    uploaded_by_user_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    storage_key text NOT NULL,
    mime_type character varying(100) NOT NULL,
    file_size integer,
    media_type character varying(50) NOT NULL,
    category character varying(80) NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    taken_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.media_assets OWNER TO postgres;

--
-- Name: opportunities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    company_id uuid NOT NULL,
    property_id uuid,
    lead_source_id uuid NOT NULL,
    pipeline_id uuid NOT NULL,
    current_stage_id uuid NOT NULL,
    current_owner_user_id uuid,
    created_by_user_id uuid NOT NULL,
    status character varying(50) DEFAULT 'OPEN'::character varying NOT NULL,
    priority character varying(30),
    canal_hunting character varying(50),
    motivo_cierre text,
    current_stage_entered_at timestamp with time zone NOT NULL,
    last_activity_at timestamp with time zone,
    won_at timestamp with time zone,
    lost_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_referral boolean DEFAULT false NOT NULL,
    referred_hunter_name character varying(255),
    partner_supervisor_id uuid
);


ALTER TABLE public.opportunities OWNER TO postgres;

--
-- Name: opportunity_stage_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_stage_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    opportunity_id uuid NOT NULL,
    from_stage_id uuid,
    to_stage_id uuid NOT NULL,
    changed_by_user_id uuid NOT NULL,
    reason text,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.opportunity_stage_history OWNER TO postgres;

--
-- Name: pipeline_stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pipeline_stages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    pipeline_id uuid NOT NULL,
    name character varying(150) NOT NULL,
    code character varying(100) NOT NULL,
    "position" integer NOT NULL,
    stage_type character varying(50) NOT NULL,
    is_initial boolean DEFAULT false NOT NULL,
    is_final boolean DEFAULT false NOT NULL,
    is_won boolean DEFAULT false NOT NULL,
    is_lost boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pipeline_stages OWNER TO postgres;

--
-- Name: pipelines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pipelines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(120) NOT NULL,
    code character varying(80) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    company_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pipelines OWNER TO postgres;

--
-- Name: pisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pisos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    torre_id uuid NOT NULL,
    numero_piso integer NOT NULL,
    hogares_cantidad integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pisos OWNER TO postgres;

--
-- Name: predios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.predios (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    nombre_proyecto text NOT NULL,
    resultado_visita character varying(150),
    detalle_visita text,
    direccion_exacta text,
    tipo_desarrollo character varying(80) NOT NULL,
    origen_prospeccion character varying(80) NOT NULL,
    clasificacion_proyecto character varying(80) NOT NULL,
    estado_construccion character varying(80) NOT NULL,
    fecha_entrega date,
    termino_montantes date,
    termino_mecha date,
    termino_fibra_optica date,
    junta_directiva character varying(10) NOT NULL,
    fecha_visita_tecnica date,
    horario_visita character varying(30),
    departamento character varying(100) DEFAULT 'Lima'::character varying NOT NULL,
    provincia character varying(100) DEFAULT 'Lima'::character varying NOT NULL,
    distrito_id uuid NOT NULL,
    urbanizacion_zona text,
    codigo_postal character varying(30),
    tipo_via character varying(50) NOT NULL,
    nombre_via text NOT NULL,
    numeracion_municipal character varying(50) NOT NULL,
    coordenadas_gps point,
    total_torres integer DEFAULT 1 NOT NULL,
    total_hogares integer DEFAULT 0 NOT NULL,
    clientes_interesados integer DEFAULT 0 NOT NULL,
    hunter_principal_id uuid,
    inmobiliaria character varying(150),
    nombre_responsable character varying(150),
    telefono_responsable character varying(30),
    cargo_responsable character varying(100),
    correo_responsable character varying(150),
    origen_ingreso character varying(80),
    canal_hunting character varying(50),
    is_referral boolean DEFAULT false NOT NULL,
    referred_hunter_name character varying(255),
    partner_supervisor_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.predios OWNER TO postgres;

--
-- Name: property_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.property_contacts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    relationship_type character varying(80) NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.property_contacts OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(80) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    supervisor_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: technical_record_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.technical_record_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    technical_record_id uuid NOT NULL,
    facade_description text,
    mounting_description text,
    access_description text,
    internal_route_description text,
    external_route_description text,
    power_availability character varying(50),
    technical_feasibility character varying(50),
    comments text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.technical_record_details OWNER TO postgres;

--
-- Name: technical_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.technical_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    opportunity_id uuid NOT NULL,
    property_id uuid NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    completed_by_user_id uuid,
    validated_by_user_id uuid,
    sent_to_win_by_user_id uuid,
    validated_at timestamp with time zone,
    sent_to_win_at timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.technical_records OWNER TO postgres;

--
-- Name: torres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.torres (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    predio_id uuid NOT NULL,
    nombre_torre text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.torres OWNER TO postgres;

--
-- Name: user_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_companies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    team_id uuid,
    role character varying(50) DEFAULT 'HUNTER'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_companies OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid,
    full_name character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    phone character varying(30),
    role character varying(50) DEFAULT 'HUNTER'::character varying NOT NULL,
    global_role character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    supervisor_id uuid,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: ventas_fija; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ventas_fija (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    opportunity_id uuid NOT NULL,
    ruc character varying(20),
    razon_social character varying(200),
    representante_legal character varying(200),
    dni_rrll character varying(20),
    celular_rrll character varying(30),
    correo_electronico character varying(150),
    nombre_padres_rrll character varying(200),
    fecha_nacimiento_rrll character varying(50),
    lugar_nacimiento_rrll character varying(100),
    tipo_domicilio character varying(50) DEFAULT 'Casa'::character varying,
    direccion_fiscal text,
    direccion_instalacion text,
    departamento character varying(100),
    provincia character varying(100),
    distrito character varying(100),
    referencia text,
    coordenadas_gps jsonb,
    tipo_tecnologia character varying(50),
    tipo_play character varying(50),
    velocidad character varying(100),
    cargo_fijo_sin_igv numeric(10,2),
    campana character varying(150),
    adicionales text,
    tipo_servicio character varying(50) DEFAULT 'Fija'::character varying,
    cantidad_lineas integer,
    tipo_movil character varying(100),
    plano_url character varying(255),
    observaciones text,
    notas_postventa text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ventas_fija OWNER TO postgres;

--
-- Data for Name: attendance_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance_events (id, attendance_session_id, user_id, event_type, coordenada, photo_media_id, created_at) FROM stdin;
\.


--
-- Data for Name: attendance_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance_sessions (id, company_id, user_id, work_date, status, started_at, ended_at, start_latitude, start_longitude, end_latitude, end_longitude, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, slug, ruc, is_active, tipo_negocio, created_at, updated_at) FROM stdin;
2115d11e-2a2f-4035-bc9c-9e11ab5faca3	Futura	futura	20111111111	t	HUNTING_EDIFICIOS	2026-07-31 00:39:26.584915+00	2026-07-31 00:39:26.584915+00
791cc28a-3ca2-46cb-9472-7054545d9721	Novacore	novacore	20222222222	t	HUNTING_EDIFICIOS	2026-07-31 00:39:26.594081+00	2026-07-31 00:39:26.594081+00
ff1b8725-9274-4b09-ab6f-52360d9d91cb	FS	fs	20333333333	t	VENTAS_B2B	2026-07-31 00:39:26.602424+00	2026-07-31 00:39:26.602424+00
\.


--
-- Data for Name: configuracion_sistema; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracion_sistema (id, clave, valor, descripcion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, company_id, full_name, phone, email, document_type, document_number, contact_type, created_by_user_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: distritos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.distritos (id, nombre) FROM stdin;
44444444-4444-4444-4444-444444444443	San Isidro
\.


--
-- Data for Name: form_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_submissions (id, opportunity_id, form_code, submitted_by_user_id, raw_payload_json, created_at) FROM stdin;
\.


--
-- Data for Name: incident_updates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incident_updates (id, incident_id, user_id, comment, next_action, next_follow_up_date, created_at) FROM stdin;
\.


--
-- Data for Name: incidents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incidents (id, company_id, opportunity_id, property_id, incident_type, status, severity, reported_by_user_id, assigned_to_user_id, description, resolution_detail, reported_at, resolved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: lead_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lead_sources (id, name, code, description, is_active, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000002	Scraping	SCR	\N	t	2026-07-31 00:39:27.988062+00	2026-07-31 00:39:27.988062+00
\.


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_assets (id, company_id, entity_type, entity_id, uploaded_by_user_id, file_name, file_url, storage_key, mime_type, file_size, media_type, category, latitude, longitude, taken_at, created_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunities (id, code, company_id, property_id, lead_source_id, pipeline_id, current_stage_id, current_owner_user_id, created_by_user_id, status, priority, canal_hunting, motivo_cierre, current_stage_entered_at, last_activity_at, won_at, lost_at, created_at, updated_at, deleted_at, is_referral, referred_hunter_name, partner_supervisor_id) FROM stdin;
ee9e9330-817f-4ad1-9738-62ed6c6513bb	HUNT-FUT-01	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	85da3f59-c4bd-42ca-9434-9c2f3fa413ec	00000000-0000-0000-0000-000000000002	2e257aa0-6bd7-4857-900e-64c20d590553	5315cd15-205c-41bd-86be-812974c3fe5d	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	OPEN	\N	FUTURA	\N	2026-07-31 00:39:28.006+00	\N	\N	\N	2026-07-31 00:39:28.007631+00	2026-07-31 00:39:28.007631+00	\N	f	\N	\N
498788e0-a61c-4b01-8254-305e13dbbd19	HUNT-FUT-02	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	540ce690-7bba-4ec8-bfcf-afe1402bbc53	00000000-0000-0000-0000-000000000002	2e257aa0-6bd7-4857-900e-64c20d590553	5315cd15-205c-41bd-86be-812974c3fe5d	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	OPEN	\N	FUTURA	\N	2026-07-31 00:39:28.026+00	\N	\N	\N	2026-07-31 00:39:28.02708+00	2026-07-31 00:39:28.02708+00	\N	f	\N	\N
167cfd55-1399-4661-bab1-2c8cfd598770	HUNT-FUT-03	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	8604183e-3b50-4b49-9c35-4e4e995ffb7a	00000000-0000-0000-0000-000000000002	2e257aa0-6bd7-4857-900e-64c20d590553	5315cd15-205c-41bd-86be-812974c3fe5d	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	OPEN	\N	FUTURA	\N	2026-07-31 00:39:28.044+00	\N	\N	\N	2026-07-31 00:39:28.044827+00	2026-07-31 00:39:28.044827+00	\N	f	\N	\N
44a2787d-a5b6-41de-a4b0-832978ee91fa	HUNT-FUT-04	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	65aae14e-1c77-441a-9893-7c9e58e6ddbc	00000000-0000-0000-0000-000000000002	2e257aa0-6bd7-4857-900e-64c20d590553	5315cd15-205c-41bd-86be-812974c3fe5d	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	OPEN	\N	FUTURA	\N	2026-07-31 00:39:28.066+00	\N	\N	\N	2026-07-31 00:39:28.066773+00	2026-07-31 00:39:28.066773+00	\N	f	\N	\N
6003acd5-bcef-4124-bef2-dc6246c48c83	HUNT-FUT-05	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	5f3f52ed-131c-4173-af1e-809c078a41cb	00000000-0000-0000-0000-000000000002	2e257aa0-6bd7-4857-900e-64c20d590553	5315cd15-205c-41bd-86be-812974c3fe5d	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	OPEN	\N	FUTURA	\N	2026-07-31 00:39:28.087+00	\N	\N	\N	2026-07-31 00:39:28.087541+00	2026-07-31 00:39:28.087541+00	\N	f	\N	\N
3571c0d0-951c-41f9-8865-4db2289bd5a2	HUNT-NOV-01	791cc28a-3ca2-46cb-9472-7054545d9721	c62d493f-0736-45a9-80f9-fb53dce2988d	00000000-0000-0000-0000-000000000002	23113cca-c443-4b43-9897-1ed9a889d25f	cb898caa-6541-460e-8c5e-a8abb3e920a6	337d713b-6c40-422a-8db2-8da0304ef951	337d713b-6c40-422a-8db2-8da0304ef951	OPEN	\N	NOVACORE	\N	2026-07-31 00:39:28.103+00	\N	\N	\N	2026-07-31 00:39:28.104012+00	2026-07-31 00:39:28.104012+00	\N	f	\N	\N
6733a6ab-153f-431f-abbe-438873579a5c	HUNT-NOV-02	791cc28a-3ca2-46cb-9472-7054545d9721	e556cbf3-b98a-4559-a409-c8ca3dd80b5c	00000000-0000-0000-0000-000000000002	23113cca-c443-4b43-9897-1ed9a889d25f	cb898caa-6541-460e-8c5e-a8abb3e920a6	337d713b-6c40-422a-8db2-8da0304ef951	337d713b-6c40-422a-8db2-8da0304ef951	OPEN	\N	NOVACORE	\N	2026-07-31 00:39:28.119+00	\N	\N	\N	2026-07-31 00:39:28.120342+00	2026-07-31 00:39:28.120342+00	\N	f	\N	\N
cccefc4d-b329-48c8-a913-f2d2aa2dabd7	HUNT-NOV-03	791cc28a-3ca2-46cb-9472-7054545d9721	49536faf-ff1c-443a-86c1-1b19fb2c3ebd	00000000-0000-0000-0000-000000000002	23113cca-c443-4b43-9897-1ed9a889d25f	cb898caa-6541-460e-8c5e-a8abb3e920a6	337d713b-6c40-422a-8db2-8da0304ef951	337d713b-6c40-422a-8db2-8da0304ef951	OPEN	\N	NOVACORE	\N	2026-07-31 00:39:28.137+00	\N	\N	\N	2026-07-31 00:39:28.137632+00	2026-07-31 00:39:28.137632+00	\N	f	\N	\N
2a7bf6da-b3e8-433e-8ee2-0d3ae43a0351	HUNT-NOV-04	791cc28a-3ca2-46cb-9472-7054545d9721	ac12993b-a583-467d-bd14-1c948e66d6c4	00000000-0000-0000-0000-000000000002	23113cca-c443-4b43-9897-1ed9a889d25f	cb898caa-6541-460e-8c5e-a8abb3e920a6	337d713b-6c40-422a-8db2-8da0304ef951	337d713b-6c40-422a-8db2-8da0304ef951	OPEN	\N	NOVACORE	\N	2026-07-31 00:39:28.153+00	\N	\N	\N	2026-07-31 00:39:28.154522+00	2026-07-31 00:39:28.154522+00	\N	f	\N	\N
87398020-11f8-418f-9cdd-6e6c93d8c765	HUNT-NOV-05	791cc28a-3ca2-46cb-9472-7054545d9721	7787dd04-f60b-4214-8bb1-e89f7fba8cda	00000000-0000-0000-0000-000000000002	23113cca-c443-4b43-9897-1ed9a889d25f	cb898caa-6541-460e-8c5e-a8abb3e920a6	337d713b-6c40-422a-8db2-8da0304ef951	337d713b-6c40-422a-8db2-8da0304ef951	OPEN	\N	NOVACORE	\N	2026-07-31 00:39:28.172+00	\N	\N	\N	2026-07-31 00:39:28.173279+00	2026-07-31 00:39:28.173279+00	\N	f	\N	\N
af81851d-72b0-49cc-8466-2c1ed51356a9	VNT-FS-01	ff1b8725-9274-4b09-ab6f-52360d9d91cb	\N	00000000-0000-0000-0000-000000000002	d219bec9-b2be-405d-872c-e76190bcf89b	d4ddd02e-51a1-48d6-9336-224c5b45eb5e	f673fc93-3fd9-4025-8a67-36a069df5ed1	f673fc93-3fd9-4025-8a67-36a069df5ed1	OPEN	\N	\N	\N	2026-07-31 00:39:28.181+00	\N	\N	\N	2026-07-31 00:39:28.18232+00	2026-07-31 00:39:28.18232+00	\N	f	\N	\N
e57298b0-6e1f-4d27-ada8-57ed2c49ff7e	VNT-FS-02	ff1b8725-9274-4b09-ab6f-52360d9d91cb	\N	00000000-0000-0000-0000-000000000002	d219bec9-b2be-405d-872c-e76190bcf89b	d4ddd02e-51a1-48d6-9336-224c5b45eb5e	f673fc93-3fd9-4025-8a67-36a069df5ed1	f673fc93-3fd9-4025-8a67-36a069df5ed1	OPEN	\N	\N	\N	2026-07-31 00:39:28.203+00	\N	\N	\N	2026-07-31 00:39:28.203738+00	2026-07-31 00:39:28.203738+00	\N	f	\N	\N
1f5ed4c7-8a65-40dc-a076-e4c3147e502d	VNT-FS-03	ff1b8725-9274-4b09-ab6f-52360d9d91cb	\N	00000000-0000-0000-0000-000000000002	d219bec9-b2be-405d-872c-e76190bcf89b	d4ddd02e-51a1-48d6-9336-224c5b45eb5e	f673fc93-3fd9-4025-8a67-36a069df5ed1	f673fc93-3fd9-4025-8a67-36a069df5ed1	OPEN	\N	\N	\N	2026-07-31 00:39:28.224+00	\N	\N	\N	2026-07-31 00:39:28.224818+00	2026-07-31 00:39:28.224818+00	\N	f	\N	\N
\.


--
-- Data for Name: opportunity_stage_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_stage_history (id, opportunity_id, from_stage_id, to_stage_id, changed_by_user_id, reason, changed_at) FROM stdin;
\.


--
-- Data for Name: pipeline_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipeline_stages (id, pipeline_id, name, code, "position", stage_type, is_initial, is_final, is_won, is_lost, created_at, updated_at) FROM stdin;
5315cd15-205c-41bd-86be-812974c3fe5d	2e257aa0-6bd7-4857-900e-64c20d590553	Edificio Prospectado	PHU-FUTURA-S1	1	STANDARD	t	f	f	f	2026-07-31 00:39:26.623725+00	2026-07-31 00:39:26.623725+00
d480f94e-42b7-4e43-9fb3-4a32d2b23434	2e257aa0-6bd7-4857-900e-64c20d590553	Prospecto Aceptado / Trabajable	PHU-FUTURA-S2	2	STANDARD	f	f	f	f	2026-07-31 00:39:26.633082+00	2026-07-31 00:39:26.633082+00
09c2437f-9d98-4eab-8b43-36859b385172	2e257aa0-6bd7-4857-900e-64c20d590553	Prospecto Rechazado / No Trabajable	PHU-FUTURA-S3	3	LOST	f	t	f	t	2026-07-31 00:39:26.64133+00	2026-07-31 00:39:26.64133+00
fa9be781-f81f-4467-84d0-e7a085509dc2	2e257aa0-6bd7-4857-900e-64c20d590553	Pendiente Envío de Formulario de Asignación	PHU-FUTURA-S4	4	STANDARD	f	f	f	f	2026-07-31 00:39:26.649857+00	2026-07-31 00:39:26.649857+00
bd48273d-eab3-4268-aea8-28e9627aa848	2e257aa0-6bd7-4857-900e-64c20d590553	Formulario de Asignación/Reasignación Completado	PHU-FUTURA-S5	5	STANDARD	f	f	f	f	2026-07-31 00:39:26.658455+00	2026-07-31 00:39:26.658455+00
677d22d6-29ad-4450-845a-e1cd30826337	2e257aa0-6bd7-4857-900e-64c20d590553	Validación Back Office	PHU-FUTURA-S6	6	STANDARD	f	f	f	f	2026-07-31 00:39:26.666671+00	2026-07-31 00:39:26.666671+00
3aa6d7b0-a0c0-4e52-900d-b7eb6e529a1b	2e257aa0-6bd7-4857-900e-64c20d590553	Solicitud de Asignación/Reasignación Enviada a WIN	PHU-FUTURA-S7	7	STANDARD	f	f	f	f	2026-07-31 00:39:26.675437+00	2026-07-31 00:39:26.675437+00
ced789aa-5a65-43cc-9dcf-0d034f6fa6dc	2e257aa0-6bd7-4857-900e-64c20d590553	Esperando Respuesta WIN	PHU-FUTURA-S8	8	STANDARD	f	f	f	f	2026-07-31 00:39:26.683439+00	2026-07-31 00:39:26.683439+00
6a5f18dd-2e18-4920-8a7c-1365c0dbcd97	2e257aa0-6bd7-4857-900e-64c20d590553	Asignación Aprobada	PHU-FUTURA-S9	9	STANDARD	f	f	f	f	2026-07-31 00:39:26.691301+00	2026-07-31 00:39:26.691301+00
d14be9d9-6729-47a1-9811-a7b9cdd9db53	2e257aa0-6bd7-4857-900e-64c20d590553	Asignación Rechazada	PHU-FUTURA-S10	10	STANDARD	f	f	f	f	2026-07-31 00:39:26.699366+00	2026-07-31 00:39:26.699366+00
55bb2dfa-0db4-43f8-8e5e-bddbbd20b870	2e257aa0-6bd7-4857-900e-64c20d590553	Pendiente Reasignación	PHU-FUTURA-S11	11	STANDARD	f	f	f	f	2026-07-31 00:39:26.707772+00	2026-07-31 00:39:26.707772+00
d6dbb580-c825-47ee-8dcc-729bccece31a	2e257aa0-6bd7-4857-900e-64c20d590553	Pendiente Envío de Formulario Ficha de Datos	PHU-FUTURA-S12	12	STANDARD	f	f	f	f	2026-07-31 00:39:26.715819+00	2026-07-31 00:39:26.715819+00
9b19af93-551e-441d-a362-c86de2dc649f	2e257aa0-6bd7-4857-900e-64c20d590553	Formulario de Ficha de Datos Completado	PHU-FUTURA-S13	13	STANDARD	f	f	f	f	2026-07-31 00:39:26.724315+00	2026-07-31 00:39:26.724315+00
c0f96912-704b-4c35-937e-0a98313a9d57	2e257aa0-6bd7-4857-900e-64c20d590553	Validación Back Office 2	PHU-FUTURA-S14	14	STANDARD	f	f	f	f	2026-07-31 00:39:26.731844+00	2026-07-31 00:39:26.731844+00
99498d9f-93ff-4460-8c05-1359f8172645	2e257aa0-6bd7-4857-900e-64c20d590553	Ficha de Datos Enviada a WIN	PHU-FUTURA-S15	15	STANDARD	f	f	f	f	2026-07-31 00:39:26.741325+00	2026-07-31 00:39:26.741325+00
c26aca9b-67dc-44a2-9305-7b8740488eda	2e257aa0-6bd7-4857-900e-64c20d590553	Pendiente Inicio de Habilitación (construcción)	PHU-FUTURA-S16	16	STANDARD	f	f	f	f	2026-07-31 00:39:26.748845+00	2026-07-31 00:39:26.748845+00
df25f097-a0c2-4fd8-891d-a3ca25a99354	2e257aa0-6bd7-4857-900e-64c20d590553	En Habilitación Técnica	PHU-FUTURA-S17	17	STANDARD	f	f	f	f	2026-07-31 00:39:26.7563+00	2026-07-31 00:39:26.7563+00
d2d06aa1-f99f-4c10-8f79-68d356083294	2e257aa0-6bd7-4857-900e-64c20d590553	Standby por Accesos	PHU-FUTURA-S18	18	STANDARD	f	f	f	f	2026-07-31 00:39:26.76431+00	2026-07-31 00:39:26.76431+00
e58d3769-dbdb-4c80-a345-6bb1e1a19426	2e257aa0-6bd7-4857-900e-64c20d590553	Habilitación Completa	PHU-FUTURA-S19	19	WON	f	t	t	f	2026-07-31 00:39:26.773309+00	2026-07-31 00:39:26.773309+00
4c9cd848-7e6c-40fc-a62e-38bc53ca7f9b	2e257aa0-6bd7-4857-900e-64c20d590553	Hunting Perdido/ No Recuperable	PHU-FUTURA-S20	20	LOST	f	t	f	t	2026-07-31 00:39:26.78186+00	2026-07-31 00:39:26.78186+00
cb898caa-6541-460e-8c5e-a8abb3e920a6	23113cca-c443-4b43-9897-1ed9a889d25f	Edificio Prospectado	PHU-NOVACORE-S1	1	STANDARD	t	f	f	f	2026-07-31 00:39:26.801433+00	2026-07-31 00:39:26.801433+00
deb80c24-9051-478e-bf21-523186509ab1	23113cca-c443-4b43-9897-1ed9a889d25f	Prospecto Aceptado / Trabajable	PHU-NOVACORE-S2	2	STANDARD	f	f	f	f	2026-07-31 00:39:26.809149+00	2026-07-31 00:39:26.809149+00
97d97e08-aa69-4130-af50-d6b7d3efe96b	23113cca-c443-4b43-9897-1ed9a889d25f	Prospecto Rechazado / No Trabajable	PHU-NOVACORE-S3	3	LOST	f	t	f	t	2026-07-31 00:39:26.818497+00	2026-07-31 00:39:26.818497+00
184e7847-da03-4490-8e22-8fbf74860205	23113cca-c443-4b43-9897-1ed9a889d25f	Pendiente Envío de Formulario de Asignación	PHU-NOVACORE-S4	4	STANDARD	f	f	f	f	2026-07-31 00:39:26.829174+00	2026-07-31 00:39:26.829174+00
be2acb6e-3881-44ee-a68a-97e4ed5c504c	23113cca-c443-4b43-9897-1ed9a889d25f	Formulario de Asignación/Reasignación Completado	PHU-NOVACORE-S5	5	STANDARD	f	f	f	f	2026-07-31 00:39:26.837498+00	2026-07-31 00:39:26.837498+00
528b7e88-48d8-4a02-896c-0385ca2bfc0a	23113cca-c443-4b43-9897-1ed9a889d25f	Validación Back Office	PHU-NOVACORE-S6	6	STANDARD	f	f	f	f	2026-07-31 00:39:26.844843+00	2026-07-31 00:39:26.844843+00
c7282d76-896f-417d-a44c-22e9a3308358	23113cca-c443-4b43-9897-1ed9a889d25f	Solicitud de Asignación/Reasignación Enviada a WIN	PHU-NOVACORE-S7	7	STANDARD	f	f	f	f	2026-07-31 00:39:26.852248+00	2026-07-31 00:39:26.852248+00
7ae934d5-2b43-4d04-b804-f196f02c3108	23113cca-c443-4b43-9897-1ed9a889d25f	Esperando Respuesta WIN	PHU-NOVACORE-S8	8	STANDARD	f	f	f	f	2026-07-31 00:39:26.8597+00	2026-07-31 00:39:26.8597+00
47f64a4c-369f-4853-a0ae-cbe39813d565	23113cca-c443-4b43-9897-1ed9a889d25f	Asignación Aprobada	PHU-NOVACORE-S9	9	STANDARD	f	f	f	f	2026-07-31 00:39:26.867382+00	2026-07-31 00:39:26.867382+00
930f158c-ae56-42de-83a8-81603aac69b4	23113cca-c443-4b43-9897-1ed9a889d25f	Asignación Rechazada	PHU-NOVACORE-S10	10	STANDARD	f	f	f	f	2026-07-31 00:39:26.876433+00	2026-07-31 00:39:26.876433+00
71d5880a-0a8c-483c-834a-782dca603ac3	23113cca-c443-4b43-9897-1ed9a889d25f	Pendiente Reasignación	PHU-NOVACORE-S11	11	STANDARD	f	f	f	f	2026-07-31 00:39:26.884005+00	2026-07-31 00:39:26.884005+00
3eb1ebc7-4089-4b05-a95b-f9f52a332f3d	23113cca-c443-4b43-9897-1ed9a889d25f	Pendiente Envío de Formulario Ficha de Datos	PHU-NOVACORE-S12	12	STANDARD	f	f	f	f	2026-07-31 00:39:26.891337+00	2026-07-31 00:39:26.891337+00
0526285d-424c-46ed-8e8c-7ac5340f32e0	23113cca-c443-4b43-9897-1ed9a889d25f	Formulario de Ficha de Datos Completado	PHU-NOVACORE-S13	13	STANDARD	f	f	f	f	2026-07-31 00:39:26.898707+00	2026-07-31 00:39:26.898707+00
9622190d-c5d7-452d-afa2-9fa065c3a285	23113cca-c443-4b43-9897-1ed9a889d25f	Validación Back Office 2	PHU-NOVACORE-S14	14	STANDARD	f	f	f	f	2026-07-31 00:39:26.905862+00	2026-07-31 00:39:26.905862+00
f4b5227a-ffb5-4a02-9d45-8dfca00dab1e	23113cca-c443-4b43-9897-1ed9a889d25f	Ficha de Datos Enviada a WIN	PHU-NOVACORE-S15	15	STANDARD	f	f	f	f	2026-07-31 00:39:26.913597+00	2026-07-31 00:39:26.913597+00
8660c6a6-79ec-49ed-973a-2e5e4df69b77	23113cca-c443-4b43-9897-1ed9a889d25f	Pendiente Inicio de Habilitación (construcción)	PHU-NOVACORE-S16	16	STANDARD	f	f	f	f	2026-07-31 00:39:26.920945+00	2026-07-31 00:39:26.920945+00
d4a3939c-9589-46b7-afea-b4a535db8484	23113cca-c443-4b43-9897-1ed9a889d25f	En Habilitación Técnica	PHU-NOVACORE-S17	17	STANDARD	f	f	f	f	2026-07-31 00:39:26.928332+00	2026-07-31 00:39:26.928332+00
f7afbdc6-876b-49f9-b1d3-97ddd56f4923	23113cca-c443-4b43-9897-1ed9a889d25f	Standby por Accesos	PHU-NOVACORE-S18	18	STANDARD	f	f	f	f	2026-07-31 00:39:26.935941+00	2026-07-31 00:39:26.935941+00
9995e6bf-e079-4fe8-a824-2703fba00130	23113cca-c443-4b43-9897-1ed9a889d25f	Habilitación Completa	PHU-NOVACORE-S19	19	WON	f	t	t	f	2026-07-31 00:39:26.943984+00	2026-07-31 00:39:26.943984+00
2fe3a080-0408-4802-b482-871bba53e658	23113cca-c443-4b43-9897-1ed9a889d25f	Hunting Perdido/ No Recuperable	PHU-NOVACORE-S20	20	LOST	f	t	f	t	2026-07-31 00:39:26.951416+00	2026-07-31 00:39:26.951416+00
d4ddd02e-51a1-48d6-9336-224c5b45eb5e	d219bec9-b2be-405d-872c-e76190bcf89b	Lead	PVB-FS-S1	1	STANDARD	t	f	f	f	2026-07-31 00:39:26.966067+00	2026-07-31 00:39:26.966067+00
a75a3f05-9edb-4d57-bc66-8854446cd645	d219bec9-b2be-405d-872c-e76190bcf89b	Sin Factibilidad 1	PVB-FS-S2	2	STANDARD	f	f	f	f	2026-07-31 00:39:26.973247+00	2026-07-31 00:39:26.973247+00
893c5c86-67a3-4e9f-8601-0bb6c5bb6557	d219bec9-b2be-405d-872c-e76190bcf89b	25% Propuesta Enviada	PVB-FS-S3	3	STANDARD	f	f	f	f	2026-07-31 00:39:26.980481+00	2026-07-31 00:39:26.980481+00
3b809071-9748-402a-8076-9199b2f27a06	d219bec9-b2be-405d-872c-e76190bcf89b	SEC Creada	PVB-FS-S4	4	STANDARD	f	f	f	f	2026-07-31 00:39:26.98908+00	2026-07-31 00:39:26.98908+00
91b18603-30de-425f-994e-a2e3e693e51e	d219bec9-b2be-405d-872c-e76190bcf89b	Rechazo Oferta	PVB-FS-S5	5	LOST	f	t	f	t	2026-07-31 00:39:26.997248+00	2026-07-31 00:39:26.997248+00
dbba01fd-8cf0-4a9f-8e15-6e29d521a61d	d219bec9-b2be-405d-872c-e76190bcf89b	50% Propuesta Aceptada	PVB-FS-S6	6	STANDARD	f	f	f	f	2026-07-31 00:39:27.00452+00	2026-07-31 00:39:27.00452+00
fc4052d9-c4aa-451e-b1ea-c52ada4e65cd	d219bec9-b2be-405d-872c-e76190bcf89b	Llamada Validación	PVB-FS-S7	7	STANDARD	f	f	f	f	2026-07-31 00:39:27.011635+00	2026-07-31 00:39:27.011635+00
f7052565-51d0-4363-804f-8f53aab3fa13	d219bec9-b2be-405d-872c-e76190bcf89b	75% Agendada	PVB-FS-S8	8	STANDARD	f	f	f	f	2026-07-31 00:39:27.018696+00	2026-07-31 00:39:27.018696+00
5c614465-f11f-4cc5-8c72-f5c5d37473d8	d219bec9-b2be-405d-872c-e76190bcf89b	SOT Creada	PVB-FS-S9	9	STANDARD	f	f	f	f	2026-07-31 00:39:27.026876+00	2026-07-31 00:39:27.026876+00
ee950769-a15b-4f25-a62c-afd83e2815c1	d219bec9-b2be-405d-872c-e76190bcf89b	Confirmación Visita	PVB-FS-S10	10	STANDARD	f	f	f	f	2026-07-31 00:39:27.036364+00	2026-07-31 00:39:27.036364+00
40be9b2c-8bd1-4b3a-aa8f-8d5df3f52d81	d219bec9-b2be-405d-872c-e76190bcf89b	Técnico no Asiste	PVB-FS-S11	11	STANDARD	f	f	f	f	2026-07-31 00:39:27.04322+00	2026-07-31 00:39:27.04322+00
b82220df-669a-4fa1-9359-8cdbbe539e42	d219bec9-b2be-405d-872c-e76190bcf89b	Cliente no Contesta	PVB-FS-S12	12	STANDARD	f	f	f	f	2026-07-31 00:39:27.050448+00	2026-07-31 00:39:27.050448+00
fe486b72-f486-44cd-8768-883a31840f02	d219bec9-b2be-405d-872c-e76190bcf89b	Sin Factibilidad	PVB-FS-S13	13	LOST	f	t	f	t	2026-07-31 00:39:27.057452+00	2026-07-31 00:39:27.057452+00
8bf05810-ef9e-4dfd-a650-37d8169fc770	d219bec9-b2be-405d-872c-e76190bcf89b	Instalación Incompleta	PVB-FS-S14	14	STANDARD	f	f	f	f	2026-07-31 00:39:27.064996+00	2026-07-31 00:39:27.064996+00
81aede37-89b2-4b40-99c1-c1b8af354e47	d219bec9-b2be-405d-872c-e76190bcf89b	100% Instalación Completada	PVB-FS-S15	15	STANDARD	f	f	f	f	2026-07-31 00:39:27.072166+00	2026-07-31 00:39:27.072166+00
5c224cfe-27f0-4502-ab8a-81a6797ee5e3	d219bec9-b2be-405d-872c-e76190bcf89b	Llamada de Control	PVB-FS-S16	16	STANDARD	f	f	f	f	2026-07-31 00:39:27.079593+00	2026-07-31 00:39:27.079593+00
e77b6702-1be9-4f5b-b496-1509dbf0afca	d219bec9-b2be-405d-872c-e76190bcf89b	Llamada Postventa	PVB-FS-S17	17	STANDARD	f	f	f	f	2026-07-31 00:39:27.087201+00	2026-07-31 00:39:27.087201+00
711e34df-72ce-42c0-a01d-6ef3ae975a3c	d219bec9-b2be-405d-872c-e76190bcf89b	Recibo 1	PVB-FS-S18	18	STANDARD	f	f	f	f	2026-07-31 00:39:27.09445+00	2026-07-31 00:39:27.09445+00
b0a4976f-ef2e-4028-bb20-6991d39dbc3f	d219bec9-b2be-405d-872c-e76190bcf89b	Recibo 2	PVB-FS-S19	19	STANDARD	f	f	f	f	2026-07-31 00:39:27.101982+00	2026-07-31 00:39:27.101982+00
67b715aa-2c46-4cce-bc48-8b9250d67cbd	d219bec9-b2be-405d-872c-e76190bcf89b	Recibo 3	PVB-FS-S20	20	WON	f	t	t	f	2026-07-31 00:39:27.109009+00	2026-07-31 00:39:27.109009+00
7a2969db-8129-4256-b3ea-70aa58b207dc	d219bec9-b2be-405d-872c-e76190bcf89b	Baja de Cliente	PVB-FS-S21	21	LOST	f	t	f	t	2026-07-31 00:39:27.117764+00	2026-07-31 00:39:27.117764+00
\.


--
-- Data for Name: pipelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipelines (id, name, code, description, is_active, company_id, created_at, updated_at) FROM stdin;
2e257aa0-6bd7-4857-900e-64c20d590553	Pipeline Futura	PHU-FUTURA	\N	t	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	2026-07-31 00:39:26.612208+00	2026-07-31 00:39:26.612208+00
23113cca-c443-4b43-9897-1ed9a889d25f	Pipeline Novacore	PHU-NOVACORE	\N	t	791cc28a-3ca2-46cb-9472-7054545d9721	2026-07-31 00:39:26.789265+00	2026-07-31 00:39:26.789265+00
d219bec9-b2be-405d-872c-e76190bcf89b	Pipeline FS	PVB-FS	\N	t	ff1b8725-9274-4b09-ab6f-52360d9d91cb	2026-07-31 00:39:26.958704+00	2026-07-31 00:39:26.958704+00
\.


--
-- Data for Name: pisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pisos (id, torre_id, numero_piso, hogares_cantidad, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: predios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.predios (id, company_id, nombre_proyecto, resultado_visita, detalle_visita, direccion_exacta, tipo_desarrollo, origen_prospeccion, clasificacion_proyecto, estado_construccion, fecha_entrega, termino_montantes, termino_mecha, termino_fibra_optica, junta_directiva, fecha_visita_tecnica, horario_visita, departamento, provincia, distrito_id, urbanizacion_zona, codigo_postal, tipo_via, nombre_via, numeracion_municipal, coordenadas_gps, total_torres, total_hogares, clientes_interesados, hunter_principal_id, inmobiliaria, nombre_responsable, telefono_responsable, cargo_responsable, correo_responsable, origen_ingreso, canal_hunting, is_referral, referred_hunter_name, partner_supervisor_id, created_at, updated_at, deleted_at) FROM stdin;
85da3f59-c4bd-42ca-9434-9c2f3fa413ec	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	Predio Futura 1	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	201	\N	1	0	0	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 00:39:27.9972+00	2026-07-31 00:39:27.9972+00	\N
540ce690-7bba-4ec8-bfcf-afe1402bbc53	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	Predio Futura 2	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	202	\N	1	0	0	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 00:39:28.018718+00	2026-07-31 00:39:28.018718+00	\N
8604183e-3b50-4b49-9c35-4e4e995ffb7a	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	Predio Futura 3	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	203	\N	1	0	0	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 00:39:28.036821+00	2026-07-31 00:39:28.036821+00	\N
65aae14e-1c77-441a-9893-7c9e58e6ddbc	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	Predio Futura 4	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	204	\N	1	0	0	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 00:39:28.058147+00	2026-07-31 00:39:28.058147+00	\N
5f3f52ed-131c-4173-af1e-809c078a41cb	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	Predio Futura 5	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	205	\N	1	0	0	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 00:39:28.079135+00	2026-07-31 00:39:28.079135+00	\N
c62d493f-0736-45a9-80f9-fb53dce2988d	791cc28a-3ca2-46cb-9472-7054545d9721	Predio Novacore 1	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	201	\N	1	0	0	337d713b-6c40-422a-8db2-8da0304ef951	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 00:39:28.096097+00	2026-07-31 00:39:28.096097+00	\N
e556cbf3-b98a-4559-a409-c8ca3dd80b5c	791cc28a-3ca2-46cb-9472-7054545d9721	Predio Novacore 2	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	202	\N	1	0	0	337d713b-6c40-422a-8db2-8da0304ef951	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 00:39:28.112574+00	2026-07-31 00:39:28.112574+00	\N
49536faf-ff1c-443a-86c1-1b19fb2c3ebd	791cc28a-3ca2-46cb-9472-7054545d9721	Predio Novacore 3	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	203	\N	1	0	0	337d713b-6c40-422a-8db2-8da0304ef951	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 00:39:28.129525+00	2026-07-31 00:39:28.129525+00	\N
ac12993b-a583-467d-bd14-1c948e66d6c4	791cc28a-3ca2-46cb-9472-7054545d9721	Predio Novacore 4	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	204	\N	1	0	0	337d713b-6c40-422a-8db2-8da0304ef951	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 00:39:28.146217+00	2026-07-31 00:39:28.146217+00	\N
7787dd04-f60b-4214-8bb1-e89f7fba8cda	791cc28a-3ca2-46cb-9472-7054545d9721	Predio Novacore 5	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	205	\N	1	0	0	337d713b-6c40-422a-8db2-8da0304ef951	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 00:39:28.164784+00	2026-07-31 00:39:28.164784+00	\N
\.


--
-- Data for Name: property_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_contacts (id, property_id, contact_id, relationship_type, is_primary, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, company_id, name, supervisor_id, is_active, created_at, updated_at) FROM stdin;
4153934b-b8ad-4432-81d6-1c3dfd94c20a	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Equipo Giovanni Figueroa	54d2105f-e4d8-477c-a837-7011d9be134d	t	2026-07-31 00:39:27.627596+00	2026-07-31 00:39:27.627596+00
fbaea2ea-1f39-41ec-8582-9f6ec00aa7ed	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Equipo Joselyn Rengifo	a243c1fe-c35c-4ca3-a967-d0f5f2059d2f	t	2026-07-31 00:39:27.635867+00	2026-07-31 00:39:27.635867+00
e80e3ce4-4f2e-43ca-94fa-a9fdd6fe8007	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Equipo Edwin Roca	4b7b2f2d-b86f-4a94-bd04-d32cc1424b6c	t	2026-07-31 00:39:27.643159+00	2026-07-31 00:39:27.643159+00
63f440e2-e182-402c-9175-dbe70685a7a1	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Equipo SubAgencia	9f63e558-2c11-4146-b8c0-feeeaf11338d	t	2026-07-31 00:39:27.650076+00	2026-07-31 00:39:27.650076+00
\.


--
-- Data for Name: technical_record_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.technical_record_details (id, technical_record_id, facade_description, mounting_description, access_description, internal_route_description, external_route_description, power_availability, technical_feasibility, comments, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: technical_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.technical_records (id, company_id, opportunity_id, property_id, status, completed_by_user_id, validated_by_user_id, sent_to_win_by_user_id, validated_at, sent_to_win_at, observations, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: torres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.torres (id, predio_id, nombre_torre, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_companies (id, user_id, company_id, team_id, role, is_active, created_at, updated_at) FROM stdin;
dabd8a8e-2f85-43d9-9acf-bdfa0a09fa0e	99f599b3-fbb4-4806-988e-a4075bbf643b	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	\N	ACCOUNT_ADMIN	t	2026-07-31 00:39:27.133262+00	2026-07-31 00:39:27.133262+00
066bd4d9-cdb6-4ff9-aa32-187facb9da01	07304790-117b-482b-928e-3a69b425a484	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	\N	SUPERVISOR_HUNTING	t	2026-07-31 00:39:27.149646+00	2026-07-31 00:39:27.149646+00
81e50942-eb51-4b2c-babb-058205dbf111	2a9d5944-7477-46b5-801f-0627d47628b8	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	\N	BACKOFFICE	t	2026-07-31 00:39:27.165484+00	2026-07-31 00:39:27.165484+00
615a4846-e7cb-474d-a87b-f9a425aeede5	fe4e5dbf-ce6e-4f00-871e-e294f0df0551	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	\N	HUNTER	t	2026-07-31 00:39:27.183645+00	2026-07-31 00:39:27.183645+00
e558ab9f-2555-4c47-a144-46888cc732f6	59384def-367f-4be9-8d08-6fc82f8195be	791cc28a-3ca2-46cb-9472-7054545d9721	\N	ACCOUNT_ADMIN	t	2026-07-31 00:39:27.19875+00	2026-07-31 00:39:27.19875+00
737d9751-ee5f-468f-92b4-cc01a2d25186	337d713b-6c40-422a-8db2-8da0304ef951	791cc28a-3ca2-46cb-9472-7054545d9721	\N	HUNTER	t	2026-07-31 00:39:27.214405+00	2026-07-31 00:39:27.214405+00
c8e5c62b-8a37-405b-9130-3471a09c24b9	4873a443-dc58-4095-8fb8-c7900bdcc105	ff1b8725-9274-4b09-ab6f-52360d9d91cb	\N	ACCOUNT_ADMIN	t	2026-07-31 00:39:27.229355+00	2026-07-31 00:39:27.229355+00
7752954b-aca8-4c6c-86f4-57544f405748	70976f6a-6407-44fc-a2c0-4fc3e3f97fb5	ff1b8725-9274-4b09-ab6f-52360d9d91cb	\N	BACKOFFICE	t	2026-07-31 00:39:27.245299+00	2026-07-31 00:39:27.245299+00
71691ec8-fbc9-42fe-9be3-a87f96e19a1e	4a1c51af-ad7a-4105-abdd-930a535fd660	ff1b8725-9274-4b09-ab6f-52360d9d91cb	\N	POSTVENTA	t	2026-07-31 00:39:27.260256+00	2026-07-31 00:39:27.260256+00
094bc771-a917-4943-934f-937867840b9c	f673fc93-3fd9-4025-8a67-36a069df5ed1	ff1b8725-9274-4b09-ab6f-52360d9d91cb	\N	ASESOR_VENTAS	t	2026-07-31 00:39:27.275599+00	2026-07-31 00:39:27.275599+00
5f1b16e2-0f9b-42af-830f-62a0cf337d23	54d2105f-e4d8-477c-a837-7011d9be134d	ff1b8725-9274-4b09-ab6f-52360d9d91cb	4153934b-b8ad-4432-81d6-1c3dfd94c20a	SUPERVISOR_VENTAS	t	2026-07-31 00:39:27.293015+00	2026-07-31 00:39:27.661043+00
2fb640a0-386b-49dc-97dd-793f6941e22b	a243c1fe-c35c-4ca3-a967-d0f5f2059d2f	ff1b8725-9274-4b09-ab6f-52360d9d91cb	fbaea2ea-1f39-41ec-8582-9f6ec00aa7ed	SUPERVISOR_VENTAS	t	2026-07-31 00:39:27.308277+00	2026-07-31 00:39:27.67432+00
c0e77984-de6d-4998-80dd-ac70a3d58b5d	4b7b2f2d-b86f-4a94-bd04-d32cc1424b6c	ff1b8725-9274-4b09-ab6f-52360d9d91cb	e80e3ce4-4f2e-43ca-94fa-a9fdd6fe8007	SUPERVISOR_VENTAS	t	2026-07-31 00:39:27.323192+00	2026-07-31 00:39:27.683158+00
0b424889-2ec6-4b30-85e5-868b1137b5d5	9f63e558-2c11-4146-b8c0-feeeaf11338d	ff1b8725-9274-4b09-ab6f-52360d9d91cb	63f440e2-e182-402c-9175-dbe70685a7a1	SUPERVISOR_VENTAS	t	2026-07-31 00:39:27.339604+00	2026-07-31 00:39:27.691957+00
59c31b47-f988-424e-a42c-275a19bde218	cd8ba149-0422-44ea-bbb5-05f1e9e975ef	ff1b8725-9274-4b09-ab6f-52360d9d91cb	4153934b-b8ad-4432-81d6-1c3dfd94c20a	ASESOR_VENTAS	t	2026-07-31 00:39:27.354305+00	2026-07-31 00:39:27.709602+00
48b73d7e-3123-4b6b-a094-a5071e7672a9	ea7ed29d-cffb-4e1c-bdd0-fe00cf392ad6	ff1b8725-9274-4b09-ab6f-52360d9d91cb	4153934b-b8ad-4432-81d6-1c3dfd94c20a	ASESOR_VENTAS	t	2026-07-31 00:39:27.36936+00	2026-07-31 00:39:27.725718+00
41492609-a9e5-4f94-bf27-dd1a9c715015	1bc2e205-916f-4b3c-ac4e-e8b78b8892e1	ff1b8725-9274-4b09-ab6f-52360d9d91cb	4153934b-b8ad-4432-81d6-1c3dfd94c20a	ASESOR_VENTAS	t	2026-07-31 00:39:27.384809+00	2026-07-31 00:39:27.742262+00
4021df1c-fe14-4175-9e03-790312f38d15	a6ce9904-6e78-47dd-9159-a576ab75e3f9	ff1b8725-9274-4b09-ab6f-52360d9d91cb	4153934b-b8ad-4432-81d6-1c3dfd94c20a	ASESOR_VENTAS	t	2026-07-31 00:39:27.399751+00	2026-07-31 00:39:27.758494+00
b3f52218-5984-4931-924d-5024874f343b	5ddea24a-6eff-44ee-ba88-92fb2c6a4d71	ff1b8725-9274-4b09-ab6f-52360d9d91cb	4153934b-b8ad-4432-81d6-1c3dfd94c20a	ASESOR_VENTAS	t	2026-07-31 00:39:27.414317+00	2026-07-31 00:39:27.774149+00
e13e034e-6a56-4352-b5fb-8894ee0d660a	c18fa6e0-d04c-4f2f-819e-63cf0d202e1b	ff1b8725-9274-4b09-ab6f-52360d9d91cb	4153934b-b8ad-4432-81d6-1c3dfd94c20a	ASESOR_VENTAS	t	2026-07-31 00:39:27.430618+00	2026-07-31 00:39:27.791992+00
93aadfd3-2880-4c35-8862-a16fa2c88bdb	ee76803e-79b3-4fbc-8224-9d1866c521d9	ff1b8725-9274-4b09-ab6f-52360d9d91cb	fbaea2ea-1f39-41ec-8582-9f6ec00aa7ed	ASESOR_VENTAS	t	2026-07-31 00:39:27.445956+00	2026-07-31 00:39:27.809332+00
11916aa4-beee-4978-816c-1c9d8726052c	95e57831-e26e-422b-98a4-108c436dca32	ff1b8725-9274-4b09-ab6f-52360d9d91cb	fbaea2ea-1f39-41ec-8582-9f6ec00aa7ed	ASESOR_VENTAS	t	2026-07-31 00:39:27.460575+00	2026-07-31 00:39:27.824978+00
32cd5f84-9490-4543-9ed0-95c9325f2edc	c5f91702-cdb3-4117-acc2-ab49d156d79f	ff1b8725-9274-4b09-ab6f-52360d9d91cb	fbaea2ea-1f39-41ec-8582-9f6ec00aa7ed	ASESOR_VENTAS	t	2026-07-31 00:39:27.474886+00	2026-07-31 00:39:27.841066+00
578798c6-169b-47e6-8c8d-067814b03a57	54d8794a-d893-4965-8451-88ab2c801c80	ff1b8725-9274-4b09-ab6f-52360d9d91cb	fbaea2ea-1f39-41ec-8582-9f6ec00aa7ed	ASESOR_VENTAS	t	2026-07-31 00:39:27.489813+00	2026-07-31 00:39:27.861651+00
6ca823cd-70c3-41f5-8a4e-5d18c0e2c17e	1741d4f3-0c94-4c9a-8727-3223802e3164	ff1b8725-9274-4b09-ab6f-52360d9d91cb	fbaea2ea-1f39-41ec-8582-9f6ec00aa7ed	ASESOR_VENTAS	t	2026-07-31 00:39:27.504767+00	2026-07-31 00:39:27.877054+00
fc014bbf-3c6b-4103-ae50-c0151488ec5b	7fea099c-649f-466a-bafc-7c6683c6f186	ff1b8725-9274-4b09-ab6f-52360d9d91cb	e80e3ce4-4f2e-43ca-94fa-a9fdd6fe8007	ASESOR_VENTAS	t	2026-07-31 00:39:27.521044+00	2026-07-31 00:39:27.892597+00
0bbbdfea-6557-48e1-be76-8777cd98842c	ab9d97ae-5a89-43ea-b591-981fa87803c4	ff1b8725-9274-4b09-ab6f-52360d9d91cb	e80e3ce4-4f2e-43ca-94fa-a9fdd6fe8007	ASESOR_VENTAS	t	2026-07-31 00:39:27.53636+00	2026-07-31 00:39:27.906965+00
6975acf8-9338-4323-8e75-cd76826a9809	eb1d106e-e84d-4c0f-919b-9dec80d309d0	ff1b8725-9274-4b09-ab6f-52360d9d91cb	e80e3ce4-4f2e-43ca-94fa-a9fdd6fe8007	ASESOR_VENTAS	t	2026-07-31 00:39:27.554113+00	2026-07-31 00:39:27.922443+00
7c3a40e0-3ade-41fe-b1cb-559e1d74e590	6d1ace08-5d9e-467e-884a-41d15cb0de14	ff1b8725-9274-4b09-ab6f-52360d9d91cb	e80e3ce4-4f2e-43ca-94fa-a9fdd6fe8007	ASESOR_VENTAS	t	2026-07-31 00:39:27.569264+00	2026-07-31 00:39:27.937352+00
91d81452-ddc4-4a9f-bbb7-f7d7dd15eb11	06f8546f-307e-4b10-bf20-68776c17eb40	ff1b8725-9274-4b09-ab6f-52360d9d91cb	e80e3ce4-4f2e-43ca-94fa-a9fdd6fe8007	ASESOR_VENTAS	t	2026-07-31 00:39:27.584467+00	2026-07-31 00:39:27.952495+00
ad32de6f-f63b-48ac-b35f-b9d3f7d879ef	f13e0b3a-4985-4352-9514-13a5a11ba668	ff1b8725-9274-4b09-ab6f-52360d9d91cb	63f440e2-e182-402c-9175-dbe70685a7a1	ASESOR_VENTAS	t	2026-07-31 00:39:27.59907+00	2026-07-31 00:39:27.967965+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, company_id, full_name, email, password_hash, phone, role, global_role, is_active, supervisor_id, last_login_at, created_at, updated_at, deleted_at) FROM stdin;
8ddcb4be-ef20-4b4a-b78c-46d2f3b739bc	\N	Admin Sistema	admin@tuempresa.com	$2b$10$VaLMBDeu2WDM/kl2bRvOauNJ5mTVqbNClack3Qq8KNzL/moJtMyQi	\N	ADMIN	AGENCY_ADMIN	t	\N	\N	2026-07-31 00:39:26.476552+00	2026-07-31 00:39:26.476552+00	\N
99f599b3-fbb4-4806-988e-a4075bbf643b	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	Admin Futura	admin@futura.pe	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ACCOUNT_ADMIN	\N	t	\N	\N	2026-07-31 00:39:27.124913+00	2026-07-31 00:39:27.124913+00	\N
07304790-117b-482b-928e-3a69b425a484	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	Supervisor Futura	supervisor@futura.pe	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	SUPERVISOR_HUNTING	\N	t	\N	\N	2026-07-31 00:39:27.14182+00	2026-07-31 00:39:27.14182+00	\N
2a9d5944-7477-46b5-801f-0627d47628b8	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	BO Futura	backoffice@futura.pe	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	BACKOFFICE	\N	t	\N	\N	2026-07-31 00:39:27.157739+00	2026-07-31 00:39:27.157739+00	\N
fe4e5dbf-ce6e-4f00-871e-e294f0df0551	2115d11e-2a2f-4035-bc9c-9e11ab5faca3	Hunter Futura	hunter@futura.pe	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	HUNTER	\N	t	\N	\N	2026-07-31 00:39:27.174722+00	2026-07-31 00:39:27.174722+00	\N
59384def-367f-4be9-8d08-6fc82f8195be	791cc28a-3ca2-46cb-9472-7054545d9721	Admin Novacore	admin@novacore.pe	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ACCOUNT_ADMIN	\N	t	\N	\N	2026-07-31 00:39:27.19092+00	2026-07-31 00:39:27.19092+00	\N
337d713b-6c40-422a-8db2-8da0304ef951	791cc28a-3ca2-46cb-9472-7054545d9721	Hunter Novacore	hunter@novacore.pe	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	HUNTER	\N	t	\N	\N	2026-07-31 00:39:27.206305+00	2026-07-31 00:39:27.206305+00	\N
4873a443-dc58-4095-8fb8-c7900bdcc105	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Admin FS	admin@fs.pe	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ACCOUNT_ADMIN	\N	t	\N	\N	2026-07-31 00:39:27.221984+00	2026-07-31 00:39:27.221984+00	\N
70976f6a-6407-44fc-a2c0-4fc3e3f97fb5	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Backoffice FS	backoffice@fs.pe	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	BACKOFFICE	\N	t	\N	\N	2026-07-31 00:39:27.236126+00	2026-07-31 00:39:27.236126+00	\N
4a1c51af-ad7a-4105-abdd-930a535fd660	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Postventa FS	postventa@fs.pe	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	POSTVENTA	\N	t	\N	\N	2026-07-31 00:39:27.252848+00	2026-07-31 00:39:27.252848+00	\N
f673fc93-3fd9-4025-8a67-36a069df5ed1	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Asesor Prueba	asesor.test@fs.pe	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	\N	\N	2026-07-31 00:39:27.2678+00	2026-07-31 00:39:27.2678+00	\N
54d2105f-e4d8-477c-a837-7011d9be134d	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Giovanni Figueroa	giovanni.figueroa@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-07-31 00:39:27.284075+00	2026-07-31 00:39:27.284075+00	\N
a243c1fe-c35c-4ca3-a967-d0f5f2059d2f	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Joselyn Rengifo	joselyn.rengifo@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-07-31 00:39:27.300773+00	2026-07-31 00:39:27.300773+00	\N
4b7b2f2d-b86f-4a94-bd04-d32cc1424b6c	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Edwin Roca	edwin.roca@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-07-31 00:39:27.316132+00	2026-07-31 00:39:27.316132+00	\N
9f63e558-2c11-4146-b8c0-feeeaf11338d	ff1b8725-9274-4b09-ab6f-52360d9d91cb	SubAgencia	subagencia@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-07-31 00:39:27.332404+00	2026-07-31 00:39:27.332404+00	\N
cd8ba149-0422-44ea-bbb5-05f1e9e975ef	ff1b8725-9274-4b09-ab6f-52360d9d91cb	SHEYLA RIVERA	sheyla.rivera@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	54d2105f-e4d8-477c-a837-7011d9be134d	\N	2026-07-31 00:39:27.347262+00	2026-07-31 00:39:27.699542+00	\N
ea7ed29d-cffb-4e1c-bdd0-fe00cf392ad6	ff1b8725-9274-4b09-ab6f-52360d9d91cb	BRIGITH VILCA	brigith.vilca@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	54d2105f-e4d8-477c-a837-7011d9be134d	\N	2026-07-31 00:39:27.361633+00	2026-07-31 00:39:27.71709+00	\N
1bc2e205-916f-4b3c-ac4e-e8b78b8892e1	ff1b8725-9274-4b09-ab6f-52360d9d91cb	IVAN OYOLA	ivan.oyola@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	54d2105f-e4d8-477c-a837-7011d9be134d	\N	2026-07-31 00:39:27.377211+00	2026-07-31 00:39:27.733411+00	\N
a6ce9904-6e78-47dd-9159-a576ab75e3f9	ff1b8725-9274-4b09-ab6f-52360d9d91cb	NANCY CRISOSTOMO	nancy.crisostomo@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	54d2105f-e4d8-477c-a837-7011d9be134d	\N	2026-07-31 00:39:27.392354+00	2026-07-31 00:39:27.74973+00	\N
5ddea24a-6eff-44ee-ba88-92fb2c6a4d71	ff1b8725-9274-4b09-ab6f-52360d9d91cb	SUBAGENCIA (G)	subagencia.giovanni@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	54d2105f-e4d8-477c-a837-7011d9be134d	\N	2026-07-31 00:39:27.407065+00	2026-07-31 00:39:27.765599+00	\N
ee76803e-79b3-4fbc-8224-9d1866c521d9	ff1b8725-9274-4b09-ab6f-52360d9d91cb	LESLY VARGAS	lesly.vargas@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	a243c1fe-c35c-4ca3-a967-d0f5f2059d2f	\N	2026-07-31 00:39:27.438281+00	2026-07-31 00:39:27.800703+00	\N
95e57831-e26e-422b-98a4-108c436dca32	ff1b8725-9274-4b09-ab6f-52360d9d91cb	WILLIAM SANTA CRUZ	william.santacruz@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	a243c1fe-c35c-4ca3-a967-d0f5f2059d2f	\N	2026-07-31 00:39:27.453468+00	2026-07-31 00:39:27.816502+00	\N
c5f91702-cdb3-4117-acc2-ab49d156d79f	ff1b8725-9274-4b09-ab6f-52360d9d91cb	IVETTE PACHAS	ivette.pachas@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	a243c1fe-c35c-4ca3-a967-d0f5f2059d2f	\N	2026-07-31 00:39:27.467898+00	2026-07-31 00:39:27.832274+00	\N
54d8794a-d893-4965-8451-88ab2c801c80	ff1b8725-9274-4b09-ab6f-52360d9d91cb	HELLEN FLORES	hellen.flores@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	a243c1fe-c35c-4ca3-a967-d0f5f2059d2f	\N	2026-07-31 00:39:27.482827+00	2026-07-31 00:39:27.852027+00	\N
1741d4f3-0c94-4c9a-8727-3223802e3164	ff1b8725-9274-4b09-ab6f-52360d9d91cb	CARLOS ALVAREZ	carlos.alvarez@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	a243c1fe-c35c-4ca3-a967-d0f5f2059d2f	\N	2026-07-31 00:39:27.497461+00	2026-07-31 00:39:27.868676+00	\N
7fea099c-649f-466a-bafc-7c6683c6f186	ff1b8725-9274-4b09-ab6f-52360d9d91cb	KATHERINE ZAPATA	katherine.zapata@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	4b7b2f2d-b86f-4a94-bd04-d32cc1424b6c	\N	2026-07-31 00:39:27.511905+00	2026-07-31 00:39:27.884422+00	\N
ab9d97ae-5a89-43ea-b591-981fa87803c4	ff1b8725-9274-4b09-ab6f-52360d9d91cb	DEYSI DIAZ	deysi.diaz@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	4b7b2f2d-b86f-4a94-bd04-d32cc1424b6c	\N	2026-07-31 00:39:27.528674+00	2026-07-31 00:39:27.899255+00	\N
eb1d106e-e84d-4c0f-919b-9dec80d309d0	ff1b8725-9274-4b09-ab6f-52360d9d91cb	SUBAGENCIA (E)	subagencia.edwin@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	4b7b2f2d-b86f-4a94-bd04-d32cc1424b6c	\N	2026-07-31 00:39:27.545037+00	2026-07-31 00:39:27.914035+00	\N
6d1ace08-5d9e-467e-884a-41d15cb0de14	ff1b8725-9274-4b09-ab6f-52360d9d91cb	REBECA BOZA	rebeca.boza@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	4b7b2f2d-b86f-4a94-bd04-d32cc1424b6c	\N	2026-07-31 00:39:27.561772+00	2026-07-31 00:39:27.929069+00	\N
06f8546f-307e-4b10-bf20-68776c17eb40	ff1b8725-9274-4b09-ab6f-52360d9d91cb	MARCO PEREZ	marco.perez@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	4b7b2f2d-b86f-4a94-bd04-d32cc1424b6c	\N	2026-07-31 00:39:27.576954+00	2026-07-31 00:39:27.944161+00	\N
f13e0b3a-4985-4352-9514-13a5a11ba668	ff1b8725-9274-4b09-ab6f-52360d9d91cb	PABLO SAENZ	pablo.saenz@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.	\N	ASESOR_VENTAS	\N	t	9f63e558-2c11-4146-b8c0-feeeaf11338d	\N	2026-07-31 00:39:27.591879+00	2026-07-31 00:39:27.959587+00	\N
c18fa6e0-d04c-4f2f-819e-63cf0d202e1b	ff1b8725-9274-4b09-ab6f-52360d9d91cb	Giovanni Figueroa	giovanni.personal@conection-futura.com	$2b$10$8x8y0MxXlK260i7b6VZ4VeUmrQ89tvFLrQrHIL3VNmGMzPPgBxpo.		ASESOR_VENTAS	\N	t	54d2105f-e4d8-477c-a837-7011d9be134d	\N	2026-07-31 00:39:27.42184+00	2026-07-31 01:11:49.001016+00	\N
\.


--
-- Data for Name: ventas_fija; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventas_fija (id, opportunity_id, ruc, razon_social, representante_legal, dni_rrll, celular_rrll, correo_electronico, nombre_padres_rrll, fecha_nacimiento_rrll, lugar_nacimiento_rrll, tipo_domicilio, direccion_fiscal, direccion_instalacion, departamento, provincia, distrito, referencia, coordenadas_gps, tipo_tecnologia, tipo_play, velocidad, cargo_fijo_sin_igv, campana, adicionales, tipo_servicio, cantidad_lineas, tipo_movil, plano_url, observaciones, notas_postventa, created_at, updated_at) FROM stdin;
bd892c98-0c4b-460c-94aa-b9666231d7b8	af81851d-72b0-49cc-8466-2c1ed51356a9	20555555551	Corporación Inka S.A.C.	Juan Perez Lopez	40404040	999888777	contacto@cliente.com	\N	\N	\N	Oficina	Av. Paseo de la República 321	Av. Paseo de la República 321, Int 502	Lima	Lima	San Isidro	\N	\N	FTTH	1Play	400 Mbps	450.00	Campaña Corporativa 2026	\N	Fija	\N	\N	\N	Cliente corporativo de televentas	\N	2026-07-31 00:39:28.190783+00	2026-07-31 00:39:28.190783+00
8e99c8bd-7762-4e2d-8c0b-cc12c5332e32	e57298b0-6e1f-4d27-ada8-57ed2c49ff7e	20555555552	Logística Transandina	Juan Perez Lopez	40404040	999888777	contacto@cliente.com	\N	\N	\N	Oficina	Av. Paseo de la República 321	Av. Paseo de la República 321, Int 502	Lima	Lima	San Isidro	\N	\N	FTTH	1Play	400 Mbps	720.00	Campaña Corporativa 2026	\N	Fija	\N	\N	\N	Cliente corporativo de televentas	\N	2026-07-31 00:39:28.215563+00	2026-07-31 00:39:28.215563+00
fed66dbe-c6b9-4d12-8564-e1eee8d07c2a	1f5ed4c7-8a65-40dc-a076-e4c3147e502d	20555555553	Servicios Médicos del Perú	Juan Perez Lopez	40404040	999888777	contacto@cliente.com	\N	\N	\N	Oficina	Av. Paseo de la República 321	Av. Paseo de la República 321, Int 502	Lima	Lima	San Isidro	\N	\N	FTTH	1Play	400 Mbps	310.00	Campaña Corporativa 2026	\N	Fija	\N	\N	\N	Cliente corporativo de televentas	\N	2026-07-31 00:39:28.231935+00	2026-07-31 00:39:28.231935+00
\.


--
-- Name: opportunity_stage_history PK_053729979d852823a38c977e853; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_stage_history
    ADD CONSTRAINT "PK_053729979d852823a38c977e853" PRIMARY KEY (id);


--
-- Name: incident_updates PK_161dab39f96098bce901c2515c0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_updates
    ADD CONSTRAINT "PK_161dab39f96098bce901c2515c0" PRIMARY KEY (id);


--
-- Name: technical_records PK_1dd4280baa6aaae0b6de32c3c1a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_records
    ADD CONSTRAINT "PK_1dd4280baa6aaae0b6de32c3c1a" PRIMARY KEY (id);


--
-- Name: distritos PK_35375b171532b25f2466ce62a75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.distritos
    ADD CONSTRAINT "PK_35375b171532b25f2466ce62a75" PRIMARY KEY (id);


--
-- Name: opportunities PK_4bd9cd12ddc0ff48a5a97ddebce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "PK_4bd9cd12ddc0ff48a5a97ddebce" PRIMARY KEY (id);


--
-- Name: property_contacts PK_5f4ed030119a5599b5cbc3d2606; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_contacts
    ADD CONSTRAINT "PK_5f4ed030119a5599b5cbc3d2606" PRIMARY KEY (id);


--
-- Name: pisos PK_6f6f2f8eb0fe6fab3612a24ea67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pisos
    ADD CONSTRAINT "PK_6f6f2f8eb0fe6fab3612a24ea67" PRIMARY KEY (id);


--
-- Name: teams PK_7e5523774a38b08a6236d322403; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY (id);


--
-- Name: attendance_sessions PK_84d565d9e484e2bcdaf4a9e1890; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT "PK_84d565d9e484e2bcdaf4a9e1890" PRIMARY KEY (id);


--
-- Name: attendance_events PK_8d7140035888f869932307395ad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_events
    ADD CONSTRAINT "PK_8d7140035888f869932307395ad" PRIMARY KEY (id);


--
-- Name: pipeline_stages PK_92e43270eace072ad5182fc08e2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipeline_stages
    ADD CONSTRAINT "PK_92e43270eace072ad5182fc08e2" PRIMARY KEY (id);


--
-- Name: configuracion_sistema PK_a039ed622dc643e8374d4e1a4d3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT "PK_a039ed622dc643e8374d4e1a4d3" PRIMARY KEY (id);


--
-- Name: torres PK_a1d77d5003b73e234a64f7b2133; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torres
    ADD CONSTRAINT "PK_a1d77d5003b73e234a64f7b2133" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: contacts PK_b99cd40cfd66a99f1571f4f72e6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY (id);


--
-- Name: lead_sources PK_bc885a4409ec70ee5a810dbbd6f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_sources
    ADD CONSTRAINT "PK_bc885a4409ec70ee5a810dbbd6f" PRIMARY KEY (id);


--
-- Name: ventas_fija PK_bfbae4151fd2f524d2b4cf5aca7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas_fija
    ADD CONSTRAINT "PK_bfbae4151fd2f524d2b4cf5aca7" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: media_assets PK_ca47e9f67a5e5d8af1e75d66ee6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT "PK_ca47e9f67a5e5d8af1e75d66ee6" PRIMARY KEY (id);


--
-- Name: incidents PK_ccb34c01719889017e2246469f9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT "PK_ccb34c01719889017e2246469f9" PRIMARY KEY (id);


--
-- Name: technical_record_details PK_d1e0ba4a65799eb97a192e9c281; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_record_details
    ADD CONSTRAINT "PK_d1e0ba4a65799eb97a192e9c281" PRIMARY KEY (id);


--
-- Name: companies PK_d4bc3e82a314fa9e29f652c2c22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY (id);


--
-- Name: pipelines PK_e38ea171cdfad107c1f3db2c036; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT "PK_e38ea171cdfad107c1f3db2c036" PRIMARY KEY (id);


--
-- Name: predios PK_e8ffdecff6be5dfa294b16bb65f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predios
    ADD CONSTRAINT "PK_e8ffdecff6be5dfa294b16bb65f" PRIMARY KEY (id);


--
-- Name: user_companies PK_f41bd3ea569c8c877b9a9063abb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT "PK_f41bd3ea569c8c877b9a9063abb" PRIMARY KEY (id);


--
-- Name: form_submissions PK_fb6e1e9f26cda31c358a8a1530e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT "PK_fb6e1e9f26cda31c358a8a1530e" PRIMARY KEY (id);


--
-- Name: ventas_fija REL_cb9d88e9650b4225b9515394da; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas_fija
    ADD CONSTRAINT "REL_cb9d88e9650b4225b9515394da" UNIQUE (opportunity_id);


--
-- Name: distritos UQ_03e5c3bf0f9bc914beeb91b35af; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.distritos
    ADD CONSTRAINT "UQ_03e5c3bf0f9bc914beeb91b35af" UNIQUE (nombre);


--
-- Name: configuracion_sistema UQ_0e9b47db25c1b7916c685fbb314; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT "UQ_0e9b47db25c1b7916c685fbb314" UNIQUE (clave);


--
-- Name: pipelines UQ_3464516017669be4a8e135112ef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT "UQ_3464516017669be4a8e135112ef" UNIQUE (code);


--
-- Name: roles UQ_648e3f5447f725579d7d4ffdfb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE (name);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: lead_sources UQ_a8c7a18be01430d9e28ddef38b2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_sources
    ADD CONSTRAINT "UQ_a8c7a18be01430d9e28ddef38b2" UNIQUE (code);


--
-- Name: companies UQ_b28b07d25e4324eee577de5496d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "UQ_b28b07d25e4324eee577de5496d" UNIQUE (slug);


--
-- Name: user_companies UQ_ca73b87c901966a9fb8960916df; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT "UQ_ca73b87c901966a9fb8960916df" UNIQUE (user_id, company_id);


--
-- Name: opportunities UQ_ed4e3e1cb218bdca441f4f217e4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "UQ_ed4e3e1cb218bdca441f4f217e4" UNIQUE (code);


--
-- Name: property_contacts FK_015bb03ccab783ec53ad75b924d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_contacts
    ADD CONSTRAINT "FK_015bb03ccab783ec53ad75b924d" FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: property_contacts FK_01983defe81bae7d13ae38faec1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_contacts
    ADD CONSTRAINT "FK_01983defe81bae7d13ae38faec1" FOREIGN KEY (property_id) REFERENCES public.predios(id) ON DELETE CASCADE;


--
-- Name: incidents FK_07e76fb0a4eda527ef6d63a22d1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT "FK_07e76fb0a4eda527ef6d63a22d1" FOREIGN KEY (reported_by_user_id) REFERENCES public.users(id);


--
-- Name: teams FK_10a590f29449a3a83c9fcd5b3b3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "FK_10a590f29449a3a83c9fcd5b3b3" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: media_assets FK_11cbfeb78f50980c28cc3bc5d47; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT "FK_11cbfeb78f50980c28cc3bc5d47" FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(id);


--
-- Name: opportunities FK_21a2769bd69ab7d6dd30810dcee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "FK_21a2769bd69ab7d6dd30810dcee" FOREIGN KEY (property_id) REFERENCES public.predios(id) ON DELETE CASCADE;


--
-- Name: technical_records FK_228923cac155fb633ef0e1b9680; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_records
    ADD CONSTRAINT "FK_228923cac155fb633ef0e1b9680" FOREIGN KEY (completed_by_user_id) REFERENCES public.users(id);


--
-- Name: contacts FK_246003f5bd3075f06ec82e3e05e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "FK_246003f5bd3075f06ec82e3e05e" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: attendance_sessions FK_370d90560b45463224f0d52f584; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT "FK_370d90560b45463224f0d52f584" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: pipeline_stages FK_37b689c446ebe79ecd37e445735; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipeline_stages
    ADD CONSTRAINT "FK_37b689c446ebe79ecd37e445735" FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id);


--
-- Name: incident_updates FK_38883324b0201d481e7a84bdd9f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_updates
    ADD CONSTRAINT "FK_38883324b0201d481e7a84bdd9f" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: attendance_events FK_3e6be77f8987376c28b9ce3283e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_events
    ADD CONSTRAINT "FK_3e6be77f8987376c28b9ce3283e" FOREIGN KEY (attendance_session_id) REFERENCES public.attendance_sessions(id);


--
-- Name: opportunities FK_4526ca09ecf0474c278b0f4a56f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "FK_4526ca09ecf0474c278b0f4a56f" FOREIGN KEY (lead_source_id) REFERENCES public.lead_sources(id);


--
-- Name: attendance_events FK_4955938be91f3cb485f7f4ce082; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_events
    ADD CONSTRAINT "FK_4955938be91f3cb485f7f4ce082" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: opportunities FK_4eaa4303f913092c822f59d4961; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "FK_4eaa4303f913092c822f59d4961" FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: user_companies FK_50c7d6aeb4ab214ad9fff29ab68; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT "FK_50c7d6aeb4ab214ad9fff29ab68" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: opportunities FK_51392868612157f01fc61a6ee2d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "FK_51392868612157f01fc61a6ee2d" FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id);


--
-- Name: opportunity_stage_history FK_5a9373c9630c8febec9ba447e04; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_stage_history
    ADD CONSTRAINT "FK_5a9373c9630c8febec9ba447e04" FOREIGN KEY (to_stage_id) REFERENCES public.pipeline_stages(id);


--
-- Name: teams FK_68bab89ca5f0c779c90393c0b6f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "FK_68bab89ca5f0c779c90393c0b6f" FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: opportunities FK_6a63b5fd5ee51bb9850d4314a44; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "FK_6a63b5fd5ee51bb9850d4314a44" FOREIGN KEY (current_stage_id) REFERENCES public.pipeline_stages(id);


--
-- Name: predios FK_6f9563c567b1b5517c1960b394f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predios
    ADD CONSTRAINT "FK_6f9563c567b1b5517c1960b394f" FOREIGN KEY (partner_supervisor_id) REFERENCES public.users(id);


--
-- Name: opportunities FK_7175ef6a09c41f4996b077a392d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "FK_7175ef6a09c41f4996b077a392d" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: incident_updates FK_795f420f5198c93365eef6565f2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_updates
    ADD CONSTRAINT "FK_795f420f5198c93365eef6565f2" FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;


--
-- Name: users FK_7ae6334059289559722437bcc1c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_7ae6334059289559722437bcc1c" FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: incidents FK_7be5a107a5d2811d0cbdf3e9a97; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT "FK_7be5a107a5d2811d0cbdf3e9a97" FOREIGN KEY (property_id) REFERENCES public.predios(id) ON DELETE CASCADE;


--
-- Name: media_assets FK_7d6484b0c19d1d61e6127e392a2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT "FK_7d6484b0c19d1d61e6127e392a2" FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: predios FK_7fb6c853032ca2ff0c583e9efef; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predios
    ADD CONSTRAINT "FK_7fb6c853032ca2ff0c583e9efef" FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: opportunity_stage_history FK_8cac1efc39f62fd15a2eaeead89; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_stage_history
    ADD CONSTRAINT "FK_8cac1efc39f62fd15a2eaeead89" FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id) ON DELETE CASCADE;


--
-- Name: user_companies FK_926ecfcdd68415362719253b635; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT "FK_926ecfcdd68415362719253b635" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: technical_records FK_94118c4f1b3f43631e5c5af8689; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_records
    ADD CONSTRAINT "FK_94118c4f1b3f43631e5c5af8689" FOREIGN KEY (validated_by_user_id) REFERENCES public.users(id);


--
-- Name: users FK_9a1bf4d0601de6693fc9b31d7f5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_9a1bf4d0601de6693fc9b31d7f5" FOREIGN KEY (supervisor_id) REFERENCES public.users(id);


--
-- Name: incidents FK_9a22bc48d1b820514b37dd63a4e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT "FK_9a22bc48d1b820514b37dd63a4e" FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id) ON DELETE CASCADE;


--
-- Name: user_companies FK_9e735e90e4fd3bbb4268ed96d94; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT "FK_9e735e90e4fd3bbb4268ed96d94" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: technical_records FK_a665c9bb35755b7c31288ca7253; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_records
    ADD CONSTRAINT "FK_a665c9bb35755b7c31288ca7253" FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id) ON DELETE CASCADE;


--
-- Name: predios FK_a810ad06a116be9e65a850c2503; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predios
    ADD CONSTRAINT "FK_a810ad06a116be9e65a850c2503" FOREIGN KEY (hunter_principal_id) REFERENCES public.users(id);


--
-- Name: contacts FK_b53945f3dfe982678bfeb5e1b4f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "FK_b53945f3dfe982678bfeb5e1b4f" FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: incidents FK_badcb77ee0329b1f36285455175; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT "FK_badcb77ee0329b1f36285455175" FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: technical_records FK_bb2a28b200484f533812a3d1279; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_records
    ADD CONSTRAINT "FK_bb2a28b200484f533812a3d1279" FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: technical_records FK_c740b0cd06e7056bc611cba9230; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_records
    ADD CONSTRAINT "FK_c740b0cd06e7056bc611cba9230" FOREIGN KEY (property_id) REFERENCES public.predios(id) ON DELETE CASCADE;


--
-- Name: ventas_fija FK_cb9d88e9650b4225b9515394da3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas_fija
    ADD CONSTRAINT "FK_cb9d88e9650b4225b9515394da3" FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id) ON DELETE CASCADE;


--
-- Name: opportunities FK_cd097e4bca8641d413ddcca648a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "FK_cd097e4bca8641d413ddcca648a" FOREIGN KEY (current_owner_user_id) REFERENCES public.users(id);


--
-- Name: attendance_sessions FK_cd927f60a9f6ade04e7df201e2a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT "FK_cd927f60a9f6ade04e7df201e2a" FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: predios FK_d4f584fad168e1503ac458e807c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predios
    ADD CONSTRAINT "FK_d4f584fad168e1503ac458e807c" FOREIGN KEY (distrito_id) REFERENCES public.distritos(id);


--
-- Name: opportunities FK_d5fd2e6db1e27e03f5cc5dc20e6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "FK_d5fd2e6db1e27e03f5cc5dc20e6" FOREIGN KEY (partner_supervisor_id) REFERENCES public.users(id);


--
-- Name: pisos FK_d8554c8fe44ab4400e9973f6beb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pisos
    ADD CONSTRAINT "FK_d8554c8fe44ab4400e9973f6beb" FOREIGN KEY (torre_id) REFERENCES public.torres(id) ON DELETE CASCADE;


--
-- Name: opportunity_stage_history FK_dbfed76769859216e72c7777452; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_stage_history
    ADD CONSTRAINT "FK_dbfed76769859216e72c7777452" FOREIGN KEY (changed_by_user_id) REFERENCES public.users(id);


--
-- Name: opportunity_stage_history FK_decbf69d1d3ebe27cd87f64d30b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_stage_history
    ADD CONSTRAINT "FK_decbf69d1d3ebe27cd87f64d30b" FOREIGN KEY (from_stage_id) REFERENCES public.pipeline_stages(id);


--
-- Name: technical_record_details FK_f8969529aec2ce504b53949cb71; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_record_details
    ADD CONSTRAINT "FK_f8969529aec2ce504b53949cb71" FOREIGN KEY (technical_record_id) REFERENCES public.technical_records(id) ON DELETE CASCADE;


--
-- Name: torres FK_fa3a2e29bc0c02d167117509669; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torres
    ADD CONSTRAINT "FK_fa3a2e29bc0c02d167117509669" FOREIGN KEY (predio_id) REFERENCES public.predios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict DoJp0OoCEa87bLcZoZeIMIwImpFVoynnCnodxoFZxQlibrbuX2vSQbMAYvEmrWt

