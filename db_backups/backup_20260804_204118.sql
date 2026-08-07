--
-- PostgreSQL database dump
--

\restrict bTNUMTv87LIgdSsSsVPJi4oRHorzsLP6MOmD7MgBDhV6dn4AuFv6btAFkSy0RKf

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
-- Name: opportunity_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    opportunity_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.opportunity_notes OWNER TO postgres;

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
d5feda56-ad48-475e-bf41-3d74e16d0f9c	Futura	futura	20111111111	t	HUNTING_EDIFICIOS	2026-08-04 18:00:10.990188+00	2026-08-04 18:00:10.990188+00
0a63ec4d-05db-46d2-aa4f-da10e59e10ad	Novacore	novacore	20222222222	t	HUNTING_EDIFICIOS	2026-08-04 18:00:10.99973+00	2026-08-04 18:00:10.99973+00
0fb6de52-18e0-4b47-9e46-8eef7345c3c2	FS	fs	20333333333	t	VENTAS_B2B	2026-08-04 18:00:11.008275+00	2026-08-04 18:00:11.008275+00
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
2233f73c-0ba5-4b5f-879d-8b6d94dc395c	0bba0448-eb44-4cb3-9ef0-73a9f570614e	FORM_REGISTRO_INICIAL	a85bbab8-0386-4873-a8a8-fb509be3247a	{"ruc": "12312523532", "campana": "FTTH Regular", "dniRrll": "76676543", "asesorId": "a85bbab8-0386-4873-a8a8-fb509be3247a", "distrito": "LIMA", "planoUrl": "ISAJ78-1", "tipoPlay": "1 Play Internet solo", "provincia": "LIMA", "tipoMovil": "Alta", "velocidad": "400mbps", "viaFiscal": "Avenida Canaval y Moreyra", "referencia": "Frente al parque", "adicionales": "No aplica", "celularRrll": "999888777", "coordenadas": "-12.082953071656533, -77.03993683723598", "razonSocial": "Servicios Médicos del Perú", "departamento": "LIMA", "distritoOtro": "", "numeroFiscal": "425", "supervisorId": "fd842e58-b0ac-4920-b313-9ef6301dd8eb", "tipoServicio": "Fija", "observaciones": "aiosjfnmioasdfwse", "tipoDomicilio": "Casa", "cantidadLineas": "", "distritoFiscal": "LURIGANCHO", "tipoTecnologia": "FTTH", "viaInstalacion": "Avenida Canaval y Moreyra", "cargoFijoSinIgv": "89.00", "direccionFiscal": "Avenida Canaval y Moreyra 425, Limatambo - LURIGANCHO, LIMA, LIMA", "nombreMadreRrll": "Cesar Rafael", "nombrePadreRrll": "Sanchez Garay", "provinciaFiscal": "LIMA", "nombrePadresRrll": "Sanchez Garay / Cesar Rafael", "correoElectronico": "rafa.sanchez@conection-futura.com", "numeroInstalacion": "425", "departamentoFiscal": "LIMA", "distritoFiscalOtro": "", "lugarNacimientoDep": "LIMA", "representanteLegal": "Juan Perez Lopez", "urbanizacionFiscal": "Limatambo", "fechaNacimientoRrll": "2026-08-07", "lugarNacimientoDist": "LIMA", "lugarNacimientoProv": "LIMA", "lugarNacimientoRrll": "LIMA - LIMA - LIMA", "direccionInstalacion": "Avenida Canaval y Moreyra 425, El Bosque", "lugarNacimientoDistOtro": "", "urbanizacionInstalacion": "El Bosque"}	2026-08-04 20:43:13.658481
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
00000000-0000-0000-0000-000000000002	Scraping	SCR	\N	t	2026-08-04 18:00:12.399932+00	2026-08-04 18:00:12.399932+00
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
0bba0448-eb44-4cb3-9ef0-73a9f570614e	OPP-193671	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	\N	00000000-0000-0000-0000-000000000002	5ce34103-f9df-4a5d-81a1-05515ac6187a	ef01f797-b161-4817-8bc2-4a9cf527af4e	a85bbab8-0386-4873-a8a8-fb509be3247a	a85bbab8-0386-4873-a8a8-fb509be3247a	OPEN	\N	\N	Sin cobertura	2026-08-04 22:20:09.07+00	2026-08-04 22:20:09.07+00	\N	\N	2026-08-04 20:43:13.658481+00	2026-08-04 22:20:09.06345+00	\N	f	\N	\N
\.


--
-- Data for Name: opportunity_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_notes (id, opportunity_id, user_id, content, created_at, updated_at) FROM stdin;
663c1ee9-46f8-41bb-8b0e-37250a111efd	0bba0448-eb44-4cb3-9ef0-73a9f570614e	940de1f2-8222-41a3-a01a-044233252610	Se hablo con el cliente pero no esta convencido 	2026-08-04 22:51:26.279871+00	2026-08-04 22:51:26.279871+00
\.


--
-- Data for Name: opportunity_stage_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_stage_history (id, opportunity_id, from_stage_id, to_stage_id, changed_by_user_id, reason, changed_at) FROM stdin;
b23fe271-1dc8-4f45-83a2-b2fdef21269e	0bba0448-eb44-4cb3-9ef0-73a9f570614e	0c40c24d-d537-4afb-9752-ea64c9d1f0af	bf4701c4-bfb9-41d6-954e-c69700792237	a85bbab8-0386-4873-a8a8-fb509be3247a	Sin cobertura	2026-08-04 20:43:28.011578+00
7deeb884-d9fa-4df9-863b-756dc8f452d9	0bba0448-eb44-4cb3-9ef0-73a9f570614e	bf4701c4-bfb9-41d6-954e-c69700792237	3ceb8b8f-b4e4-4751-a58e-fd1e37477033	a85bbab8-0386-4873-a8a8-fb509be3247a	Transición de etapa manual	2026-08-04 21:01:21.66503+00
595faf7a-82fc-43c5-b1d8-dc5839cf6ac3	0bba0448-eb44-4cb3-9ef0-73a9f570614e	3ceb8b8f-b4e4-4751-a58e-fd1e37477033	bcc2de8e-db03-4ffa-b18b-74ef309f0f42	a85bbab8-0386-4873-a8a8-fb509be3247a	Transición de etapa manual	2026-08-04 21:01:53.347373+00
5358569e-d464-47de-9538-b9faff0a5cfe	0bba0448-eb44-4cb3-9ef0-73a9f570614e	bcc2de8e-db03-4ffa-b18b-74ef309f0f42	bbc7d387-8525-4a2c-9b12-18502d7e382a	fba83223-c1c4-4859-aa54-cd23e6f53953	Transición de etapa manual	2026-08-04 21:02:09.826695+00
862e9d8f-bc30-48f2-b334-e1b216ba6042	0bba0448-eb44-4cb3-9ef0-73a9f570614e	bbc7d387-8525-4a2c-9b12-18502d7e382a	bcc2de8e-db03-4ffa-b18b-74ef309f0f42	fba83223-c1c4-4859-aa54-cd23e6f53953	Transición de etapa manual	2026-08-04 21:07:13.957761+00
0652bbb7-e8e8-40a0-9fd9-36d2dc1aa2d4	0bba0448-eb44-4cb3-9ef0-73a9f570614e	bcc2de8e-db03-4ffa-b18b-74ef309f0f42	198161e1-5dcb-4899-9dfc-c54884de5368	fba83223-c1c4-4859-aa54-cd23e6f53953	Transición de etapa manual	2026-08-04 21:07:18.835108+00
8648ac21-1bf9-4de5-83bf-b6ed54022c91	0bba0448-eb44-4cb3-9ef0-73a9f570614e	198161e1-5dcb-4899-9dfc-c54884de5368	0c40c24d-d537-4afb-9752-ea64c9d1f0af	fba83223-c1c4-4859-aa54-cd23e6f53953	Transición de etapa manual	2026-08-04 21:07:23.866234+00
d5516679-0729-45c0-b9ce-8cbd9f257690	0bba0448-eb44-4cb3-9ef0-73a9f570614e	0c40c24d-d537-4afb-9752-ea64c9d1f0af	bcc2de8e-db03-4ffa-b18b-74ef309f0f42	fba83223-c1c4-4859-aa54-cd23e6f53953	Transición de etapa manual	2026-08-04 22:19:05.280647+00
bfcca271-3a2b-43c2-9d22-9ea786fda9d2	0bba0448-eb44-4cb3-9ef0-73a9f570614e	bcc2de8e-db03-4ffa-b18b-74ef309f0f42	bcff73f7-4679-4d73-beba-292518935b41	fba83223-c1c4-4859-aa54-cd23e6f53953	Transición de etapa manual	2026-08-04 22:19:27.121188+00
4def2fb6-af12-4f57-a82c-7f960592372b	0bba0448-eb44-4cb3-9ef0-73a9f570614e	bcff73f7-4679-4d73-beba-292518935b41	18233e84-076e-4d50-bcb2-a57bdf50343e	fba83223-c1c4-4859-aa54-cd23e6f53953	Transición de etapa manual	2026-08-04 22:19:30.006547+00
70c8daa7-68a9-4391-af8a-ca0ca6b1576a	0bba0448-eb44-4cb3-9ef0-73a9f570614e	18233e84-076e-4d50-bcb2-a57bdf50343e	ef01f797-b161-4817-8bc2-4a9cf527af4e	940de1f2-8222-41a3-a01a-044233252610	Transición de etapa manual	2026-08-04 22:20:09.06345+00
\.


--
-- Data for Name: pipeline_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipeline_stages (id, pipeline_id, name, code, "position", stage_type, is_initial, is_final, is_won, is_lost, created_at, updated_at) FROM stdin;
4eb2e2f3-9920-4b47-beb7-1cb41dbc8b6a	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Edificio Prospectado	PHU-FUTURA-S1	1	STANDARD	t	f	f	f	2026-08-04 18:00:11.030385+00	2026-08-04 18:00:11.030385+00
7066dcd2-7b1f-44a2-9a80-2a0382d8eedd	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Prospecto Aceptado / Trabajable	PHU-FUTURA-S2	2	STANDARD	f	f	f	f	2026-08-04 18:00:11.041226+00	2026-08-04 18:00:11.041226+00
9666b523-0a04-42a9-a7fe-06a44228b2c1	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Prospecto Rechazado / No Trabajable	PHU-FUTURA-S3	3	LOST	f	t	f	t	2026-08-04 18:00:11.050509+00	2026-08-04 18:00:11.050509+00
29ae11d2-1e3a-4317-8c95-88af6b3e5493	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Pendiente Envío de Formulario de Asignación	PHU-FUTURA-S4	4	STANDARD	f	f	f	f	2026-08-04 18:00:11.059624+00	2026-08-04 18:00:11.059624+00
57a44286-7370-46d2-bb71-de3c22af4d1c	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Formulario de Asignación/Reasignación Completado	PHU-FUTURA-S5	5	STANDARD	f	f	f	f	2026-08-04 18:00:11.067637+00	2026-08-04 18:00:11.067637+00
224986b6-1f13-4147-b590-ff0d4397a0d0	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Validación Back Office	PHU-FUTURA-S6	6	STANDARD	f	f	f	f	2026-08-04 18:00:11.075523+00	2026-08-04 18:00:11.075523+00
9d7ae5e8-20af-4e77-8ad0-1e1240e05aea	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Solicitud de Asignación/Reasignación Enviada a WIN	PHU-FUTURA-S7	7	STANDARD	f	f	f	f	2026-08-04 18:00:11.084326+00	2026-08-04 18:00:11.084326+00
a6264eeb-3ab4-4ce0-ba84-de9239323855	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Esperando Respuesta WIN	PHU-FUTURA-S8	8	STANDARD	f	f	f	f	2026-08-04 18:00:11.092629+00	2026-08-04 18:00:11.092629+00
d9e8a6d6-3188-4fbf-9475-b6293fb1250a	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Asignación Aprobada	PHU-FUTURA-S9	9	STANDARD	f	f	f	f	2026-08-04 18:00:11.101799+00	2026-08-04 18:00:11.101799+00
4457f03d-6ef7-40c9-af25-df6585ce4677	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Asignación Rechazada	PHU-FUTURA-S10	10	STANDARD	f	f	f	f	2026-08-04 18:00:11.109705+00	2026-08-04 18:00:11.109705+00
944614ad-2349-4f5e-aaed-e123ee17ee84	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Pendiente Reasignación	PHU-FUTURA-S11	11	STANDARD	f	f	f	f	2026-08-04 18:00:11.117638+00	2026-08-04 18:00:11.117638+00
112380bf-e15a-4527-bf83-26fa6ceb4913	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Pendiente Envío de Formulario Ficha de Datos	PHU-FUTURA-S12	12	STANDARD	f	f	f	f	2026-08-04 18:00:11.125159+00	2026-08-04 18:00:11.125159+00
00c4530e-9b53-4f24-a02e-6cb5b10a4d53	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Formulario de Ficha de Datos Completado	PHU-FUTURA-S13	13	STANDARD	f	f	f	f	2026-08-04 18:00:11.132445+00	2026-08-04 18:00:11.132445+00
1fc21b5f-aea0-416b-b0f2-404d127a4d64	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Validación Back Office 2	PHU-FUTURA-S14	14	STANDARD	f	f	f	f	2026-08-04 18:00:11.140153+00	2026-08-04 18:00:11.140153+00
d3a67339-684a-47a8-948e-1a728b9a5418	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Ficha de Datos Enviada a WIN	PHU-FUTURA-S15	15	STANDARD	f	f	f	f	2026-08-04 18:00:11.150398+00	2026-08-04 18:00:11.150398+00
cb778c98-25db-4301-8fe0-d15252150b89	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Pendiente Inicio de Habilitación (construcción)	PHU-FUTURA-S16	16	STANDARD	f	f	f	f	2026-08-04 18:00:11.160623+00	2026-08-04 18:00:11.160623+00
a17e287a-e367-499e-85c6-4fd0d2624072	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	En Habilitación Técnica	PHU-FUTURA-S17	17	STANDARD	f	f	f	f	2026-08-04 18:00:11.16942+00	2026-08-04 18:00:11.16942+00
b5308553-474a-4d32-acd4-4f2d753a9b61	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Standby por Accesos	PHU-FUTURA-S18	18	STANDARD	f	f	f	f	2026-08-04 18:00:11.177018+00	2026-08-04 18:00:11.177018+00
f57eb55c-51f8-45e9-b8ea-7b859aebb523	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Habilitación Completa	PHU-FUTURA-S19	19	WON	f	t	t	f	2026-08-04 18:00:11.184495+00	2026-08-04 18:00:11.184495+00
5fbb599e-b74e-4843-99a9-ba5c18512f88	7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Hunting Perdido/ No Recuperable	PHU-FUTURA-S20	20	LOST	f	t	f	t	2026-08-04 18:00:11.192999+00	2026-08-04 18:00:11.192999+00
4f7fa9ea-65ab-4bdd-a84b-4142d453eb26	c46effd8-b1ad-433d-acab-fe04429f48c1	Edificio Prospectado	PHU-NOVACORE-S1	1	STANDARD	t	f	f	f	2026-08-04 18:00:11.208137+00	2026-08-04 18:00:11.208137+00
0026271e-5217-4660-904b-d504f09d88fe	c46effd8-b1ad-433d-acab-fe04429f48c1	Prospecto Aceptado / Trabajable	PHU-NOVACORE-S2	2	STANDARD	f	f	f	f	2026-08-04 18:00:11.214995+00	2026-08-04 18:00:11.214995+00
3a35bd60-81f1-4f48-90cc-0626fb125031	c46effd8-b1ad-433d-acab-fe04429f48c1	Prospecto Rechazado / No Trabajable	PHU-NOVACORE-S3	3	LOST	f	t	f	t	2026-08-04 18:00:11.22437+00	2026-08-04 18:00:11.22437+00
75a5b8d3-3d16-4808-938b-db92642b8d9b	c46effd8-b1ad-433d-acab-fe04429f48c1	Pendiente Envío de Formulario de Asignación	PHU-NOVACORE-S4	4	STANDARD	f	f	f	f	2026-08-04 18:00:11.231548+00	2026-08-04 18:00:11.231548+00
2f097064-9325-4f12-ae1c-b7f805b2ecce	c46effd8-b1ad-433d-acab-fe04429f48c1	Formulario de Asignación/Reasignación Completado	PHU-NOVACORE-S5	5	STANDARD	f	f	f	f	2026-08-04 18:00:11.238391+00	2026-08-04 18:00:11.238391+00
605c3903-c934-4ae5-8eb6-5d602a6bb123	c46effd8-b1ad-433d-acab-fe04429f48c1	Validación Back Office	PHU-NOVACORE-S6	6	STANDARD	f	f	f	f	2026-08-04 18:00:11.247185+00	2026-08-04 18:00:11.247185+00
5bbf7b20-5141-409d-8179-a900223e9f0f	c46effd8-b1ad-433d-acab-fe04429f48c1	Solicitud de Asignación/Reasignación Enviada a WIN	PHU-NOVACORE-S7	7	STANDARD	f	f	f	f	2026-08-04 18:00:11.255006+00	2026-08-04 18:00:11.255006+00
ce221786-eaeb-481a-ae2a-4edfa8723b0f	c46effd8-b1ad-433d-acab-fe04429f48c1	Esperando Respuesta WIN	PHU-NOVACORE-S8	8	STANDARD	f	f	f	f	2026-08-04 18:00:11.262622+00	2026-08-04 18:00:11.262622+00
bc15a945-8a0e-454a-950d-3b023784649e	c46effd8-b1ad-433d-acab-fe04429f48c1	Asignación Aprobada	PHU-NOVACORE-S9	9	STANDARD	f	f	f	f	2026-08-04 18:00:11.269615+00	2026-08-04 18:00:11.269615+00
1a353d76-7675-4529-be0d-8754e58584ba	c46effd8-b1ad-433d-acab-fe04429f48c1	Asignación Rechazada	PHU-NOVACORE-S10	10	STANDARD	f	f	f	f	2026-08-04 18:00:11.276184+00	2026-08-04 18:00:11.276184+00
da21f673-044f-4ec4-9219-4b9f7fc82cd8	c46effd8-b1ad-433d-acab-fe04429f48c1	Pendiente Reasignación	PHU-NOVACORE-S11	11	STANDARD	f	f	f	f	2026-08-04 18:00:11.283247+00	2026-08-04 18:00:11.283247+00
8e8ce416-07f7-4fe1-a1eb-9742d1898ab3	c46effd8-b1ad-433d-acab-fe04429f48c1	Pendiente Envío de Formulario Ficha de Datos	PHU-NOVACORE-S12	12	STANDARD	f	f	f	f	2026-08-04 18:00:11.292079+00	2026-08-04 18:00:11.292079+00
3bceb42c-e1cc-471f-8ba9-d53d9c0db4db	c46effd8-b1ad-433d-acab-fe04429f48c1	Formulario de Ficha de Datos Completado	PHU-NOVACORE-S13	13	STANDARD	f	f	f	f	2026-08-04 18:00:11.299398+00	2026-08-04 18:00:11.299398+00
b6f83a5b-1284-4242-862b-aab2bac211e4	c46effd8-b1ad-433d-acab-fe04429f48c1	Validación Back Office 2	PHU-NOVACORE-S14	14	STANDARD	f	f	f	f	2026-08-04 18:00:11.303962+00	2026-08-04 18:00:11.303962+00
00f8740a-dcff-4600-91a5-9520416e34cd	c46effd8-b1ad-433d-acab-fe04429f48c1	Ficha de Datos Enviada a WIN	PHU-NOVACORE-S15	15	STANDARD	f	f	f	f	2026-08-04 18:00:11.310866+00	2026-08-04 18:00:11.310866+00
ca0ef7bc-8150-40fa-9484-a6014cceb852	c46effd8-b1ad-433d-acab-fe04429f48c1	Pendiente Inicio de Habilitación (construcción)	PHU-NOVACORE-S16	16	STANDARD	f	f	f	f	2026-08-04 18:00:11.319516+00	2026-08-04 18:00:11.319516+00
8d68b36d-e738-4376-b8e7-ce513c5f6182	c46effd8-b1ad-433d-acab-fe04429f48c1	En Habilitación Técnica	PHU-NOVACORE-S17	17	STANDARD	f	f	f	f	2026-08-04 18:00:11.327183+00	2026-08-04 18:00:11.327183+00
892e7c83-4f4f-4843-baee-c480cdb94b53	c46effd8-b1ad-433d-acab-fe04429f48c1	Standby por Accesos	PHU-NOVACORE-S18	18	STANDARD	f	f	f	f	2026-08-04 18:00:11.334026+00	2026-08-04 18:00:11.334026+00
fac4135f-7bd6-4605-9b4f-15a789c25ed1	c46effd8-b1ad-433d-acab-fe04429f48c1	Habilitación Completa	PHU-NOVACORE-S19	19	WON	f	t	t	f	2026-08-04 18:00:11.340787+00	2026-08-04 18:00:11.340787+00
6a347a98-5a59-445d-81dc-99bf38d0287d	c46effd8-b1ad-433d-acab-fe04429f48c1	Hunting Perdido/ No Recuperable	PHU-NOVACORE-S20	20	LOST	f	t	f	t	2026-08-04 18:00:11.348152+00	2026-08-04 18:00:11.348152+00
0c40c24d-d537-4afb-9752-ea64c9d1f0af	5ce34103-f9df-4a5d-81a1-05515ac6187a	Lead	PVB-FS-S1	1	STANDARD	t	f	f	f	2026-08-04 18:00:11.363854+00	2026-08-04 18:00:11.363854+00
bf4701c4-bfb9-41d6-954e-c69700792237	5ce34103-f9df-4a5d-81a1-05515ac6187a	Sin Factibilidad 1	PVB-FS-S2	2	STANDARD	f	f	f	f	2026-08-04 18:00:11.370827+00	2026-08-04 18:00:11.370827+00
3ceb8b8f-b4e4-4751-a58e-fd1e37477033	5ce34103-f9df-4a5d-81a1-05515ac6187a	25% Propuesta Enviada	PVB-FS-S3	3	STANDARD	f	f	f	f	2026-08-04 18:00:11.377772+00	2026-08-04 18:00:11.377772+00
198161e1-5dcb-4899-9dfc-c54884de5368	5ce34103-f9df-4a5d-81a1-05515ac6187a	SEC Creada	PVB-FS-S4	4	STANDARD	f	f	f	f	2026-08-04 18:00:11.384279+00	2026-08-04 18:00:11.384279+00
8107f7df-cac5-4d31-80b4-e86badb11ee3	5ce34103-f9df-4a5d-81a1-05515ac6187a	Rechazo Oferta	PVB-FS-S5	5	LOST	f	t	f	t	2026-08-04 18:00:11.39254+00	2026-08-04 18:00:11.39254+00
bcc2de8e-db03-4ffa-b18b-74ef309f0f42	5ce34103-f9df-4a5d-81a1-05515ac6187a	50% Propuesta Aceptada	PVB-FS-S6	6	STANDARD	f	f	f	f	2026-08-04 18:00:11.400425+00	2026-08-04 18:00:11.400425+00
e87cfb3a-8280-4f74-ad15-e4ad3eecd403	5ce34103-f9df-4a5d-81a1-05515ac6187a	Llamada Validación	PVB-FS-S7	7	STANDARD	f	f	f	f	2026-08-04 18:00:11.407379+00	2026-08-04 18:00:11.407379+00
da6f0e2e-3e7c-489b-9637-95799af0dd2a	5ce34103-f9df-4a5d-81a1-05515ac6187a	75% Agendada	PVB-FS-S8	8	STANDARD	f	f	f	f	2026-08-04 18:00:11.414984+00	2026-08-04 18:00:11.414984+00
a8dfef57-4bb9-4038-ba9b-94a5ba7c54c2	5ce34103-f9df-4a5d-81a1-05515ac6187a	SOT Creada	PVB-FS-S9	9	STANDARD	f	f	f	f	2026-08-04 18:00:11.421753+00	2026-08-04 18:00:11.421753+00
ac37aee8-f6b3-47cb-a983-cd46020697c3	5ce34103-f9df-4a5d-81a1-05515ac6187a	Confirmación Visita	PVB-FS-S10	10	STANDARD	f	f	f	f	2026-08-04 18:00:11.429207+00	2026-08-04 18:00:11.429207+00
bbc7d387-8525-4a2c-9b12-18502d7e382a	5ce34103-f9df-4a5d-81a1-05515ac6187a	Técnico no Asiste	PVB-FS-S11	11	STANDARD	f	f	f	f	2026-08-04 18:00:11.436208+00	2026-08-04 18:00:11.436208+00
202c8f48-5d7d-4f09-a142-cdf8e14d49dc	5ce34103-f9df-4a5d-81a1-05515ac6187a	Cliente no Contesta	PVB-FS-S12	12	STANDARD	f	f	f	f	2026-08-04 18:00:11.443202+00	2026-08-04 18:00:11.443202+00
72f6eb0b-1f50-4181-91b5-95bbcf1fb830	5ce34103-f9df-4a5d-81a1-05515ac6187a	Sin Factibilidad	PVB-FS-S13	13	LOST	f	t	f	t	2026-08-04 18:00:11.449794+00	2026-08-04 18:00:11.449794+00
22e5c3d1-8984-47d4-9370-584b522b675d	5ce34103-f9df-4a5d-81a1-05515ac6187a	Instalación Incompleta	PVB-FS-S14	14	STANDARD	f	f	f	f	2026-08-04 18:00:11.457367+00	2026-08-04 18:00:11.457367+00
bcff73f7-4679-4d73-beba-292518935b41	5ce34103-f9df-4a5d-81a1-05515ac6187a	100% Instalación Completada	PVB-FS-S15	15	STANDARD	f	f	f	f	2026-08-04 18:00:11.464382+00	2026-08-04 18:00:11.464382+00
18233e84-076e-4d50-bcb2-a57bdf50343e	5ce34103-f9df-4a5d-81a1-05515ac6187a	Llamada de Control	PVB-FS-S16	16	STANDARD	f	f	f	f	2026-08-04 18:00:11.471007+00	2026-08-04 18:00:11.471007+00
ef01f797-b161-4817-8bc2-4a9cf527af4e	5ce34103-f9df-4a5d-81a1-05515ac6187a	Llamada Postventa	PVB-FS-S17	17	STANDARD	f	f	f	f	2026-08-04 18:00:11.478176+00	2026-08-04 18:00:11.478176+00
3c20e132-2126-4b0c-a2e9-65db4fb03cad	5ce34103-f9df-4a5d-81a1-05515ac6187a	Recibo 1	PVB-FS-S18	18	STANDARD	f	f	f	f	2026-08-04 18:00:11.485687+00	2026-08-04 18:00:11.485687+00
76eeee0b-5f69-4d08-aef1-d107869ed4f7	5ce34103-f9df-4a5d-81a1-05515ac6187a	Recibo 2	PVB-FS-S19	19	STANDARD	f	f	f	f	2026-08-04 18:00:11.493739+00	2026-08-04 18:00:11.493739+00
f5327117-75d4-42a0-9a0c-5fdc7ae319f6	5ce34103-f9df-4a5d-81a1-05515ac6187a	Recibo 3	PVB-FS-S20	20	WON	f	t	t	f	2026-08-04 18:00:11.500863+00	2026-08-04 18:00:11.500863+00
cde22572-5475-4247-9d68-1e64aa43ac17	5ce34103-f9df-4a5d-81a1-05515ac6187a	Baja de Cliente	PVB-FS-S21	21	LOST	f	t	f	t	2026-08-04 18:00:11.507851+00	2026-08-04 18:00:11.507851+00
\.


--
-- Data for Name: pipelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipelines (id, name, code, description, is_active, company_id, created_at, updated_at) FROM stdin;
7e0afeb4-6df9-4dd9-a95f-22c94eba81b9	Pipeline Futura	PHU-FUTURA	\N	t	d5feda56-ad48-475e-bf41-3d74e16d0f9c	2026-08-04 18:00:11.02054+00	2026-08-04 18:00:11.02054+00
c46effd8-b1ad-433d-acab-fe04429f48c1	Pipeline Novacore	PHU-NOVACORE	\N	t	0a63ec4d-05db-46d2-aa4f-da10e59e10ad	2026-08-04 18:00:11.200167+00	2026-08-04 18:00:11.200167+00
5ce34103-f9df-4a5d-81a1-05515ac6187a	Pipeline FS	PVB-FS	\N	t	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	2026-08-04 18:00:11.355137+00	2026-08-04 18:00:11.355137+00
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
4d687dc3-2b4a-4515-9e63-71d387f4a364	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Equipo Giovanni Figueroa	fd842e58-b0ac-4920-b313-9ef6301dd8eb	t	2026-08-04 18:00:12.021971+00	2026-08-04 18:00:12.021971+00
46e5c5c8-4993-4237-ab0f-77165cd30f17	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Equipo Joselyn Rengifo	78207b54-5198-4a92-8d9d-3428186b163c	t	2026-08-04 18:00:12.030291+00	2026-08-04 18:00:12.030291+00
c275e6b2-de61-4e27-9516-f841da6e9800	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Equipo Edwin Roca	e30a588a-df71-4ea7-acdc-f8201a6fb6ce	t	2026-08-04 18:00:12.037781+00	2026-08-04 18:00:12.037781+00
00b98ace-3899-4cfe-a9f6-0133e2be618e	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Equipo SubAgencia	662cc13f-cc0b-4a14-b5dd-54e2a2a80286	t	2026-08-04 18:00:12.045396+00	2026-08-04 18:00:12.045396+00
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
ccc738bb-c6b6-4d7d-9d56-6afd0e3576a0	3daeaa90-88ad-4362-a5d2-8df9af87f3c7	d5feda56-ad48-475e-bf41-3d74e16d0f9c	\N	ACCOUNT_ADMIN	t	2026-08-04 18:00:11.525482+00	2026-08-04 18:00:11.525482+00
b793e3f7-d559-479a-8557-8765a78b06db	7783419d-70e2-4ab7-8574-3792d5873827	d5feda56-ad48-475e-bf41-3d74e16d0f9c	\N	SUPERVISOR_HUNTING	t	2026-08-04 18:00:11.541827+00	2026-08-04 18:00:11.541827+00
76fca55f-1753-47a0-a826-3ecfb3834fb7	609ccae5-535a-4f0a-87ff-1b836c3cccd3	d5feda56-ad48-475e-bf41-3d74e16d0f9c	\N	BACKOFFICE	t	2026-08-04 18:00:11.556937+00	2026-08-04 18:00:11.556937+00
48fb7573-cdea-428a-9a6a-6a3f49de65e0	1d606ca3-7c73-4cbe-b56d-a8a25c7f6b2f	d5feda56-ad48-475e-bf41-3d74e16d0f9c	\N	HUNTER	t	2026-08-04 18:00:11.577191+00	2026-08-04 18:00:11.577191+00
bd035ee1-af4e-4799-8d6a-7de7919786c2	389d6c73-72ce-4fcc-9475-b1cef3ac7426	0a63ec4d-05db-46d2-aa4f-da10e59e10ad	\N	ACCOUNT_ADMIN	t	2026-08-04 18:00:11.596497+00	2026-08-04 18:00:11.596497+00
461d57cc-d6d0-4c27-bb98-638448c21f74	e0d56eac-f091-4419-8f19-fd666f4cda70	0a63ec4d-05db-46d2-aa4f-da10e59e10ad	\N	HUNTER	t	2026-08-04 18:00:11.613308+00	2026-08-04 18:00:11.613308+00
b47ee6df-0d3f-4979-8e91-05094c48b1af	fba83223-c1c4-4859-aa54-cd23e6f53953	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	\N	ACCOUNT_ADMIN	t	2026-08-04 18:00:11.629838+00	2026-08-04 18:00:11.629838+00
755a7621-2940-48c5-9980-24ecf2eed426	940de1f2-8222-41a3-a01a-044233252610	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	\N	BACKOFFICE	t	2026-08-04 18:00:11.644917+00	2026-08-04 18:00:11.644917+00
fb79c277-2d81-4908-89a7-a714a5505029	241ccb2f-57a5-4d1e-b3be-c86e20df8da1	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	\N	POSTVENTA	t	2026-08-04 18:00:11.660636+00	2026-08-04 18:00:11.660636+00
5b3be20d-85cb-437b-b5e0-362e1d529ac5	a85bbab8-0386-4873-a8a8-fb509be3247a	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	4d687dc3-2b4a-4515-9e63-71d387f4a364	ASESOR_VENTAS	t	2026-08-04 18:00:11.676696+00	2026-08-04 18:00:12.064557+00
b11cce36-0cc2-4e08-9c70-2dd716266f74	fd842e58-b0ac-4920-b313-9ef6301dd8eb	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	4d687dc3-2b4a-4515-9e63-71d387f4a364	SUPERVISOR_VENTAS	t	2026-08-04 18:00:11.692849+00	2026-08-04 18:00:12.074712+00
ffddfb1f-eb05-4fa8-90ea-cc71a2eb66c6	78207b54-5198-4a92-8d9d-3428186b163c	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	46e5c5c8-4993-4237-ab0f-77165cd30f17	SUPERVISOR_VENTAS	t	2026-08-04 18:00:11.708942+00	2026-08-04 18:00:12.084349+00
912e802a-6c8e-4c45-8a26-37f53c995f8c	e30a588a-df71-4ea7-acdc-f8201a6fb6ce	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	c275e6b2-de61-4e27-9516-f841da6e9800	SUPERVISOR_VENTAS	t	2026-08-04 18:00:11.724593+00	2026-08-04 18:00:12.093593+00
10906f1b-eb53-45bb-8bcd-82670b583db4	662cc13f-cc0b-4a14-b5dd-54e2a2a80286	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	00b98ace-3899-4cfe-a9f6-0133e2be618e	SUPERVISOR_VENTAS	t	2026-08-04 18:00:11.74189+00	2026-08-04 18:00:12.102818+00
97b4c412-d46b-499b-8465-d3ad9774306e	77353bfe-41d8-4a3d-bcd2-056b1292f724	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	4d687dc3-2b4a-4515-9e63-71d387f4a364	ASESOR_VENTAS	t	2026-08-04 18:00:11.757714+00	2026-08-04 18:00:12.11872+00
ba309522-2179-45f2-9358-9ca7d52d287d	4bba3e3b-53a2-47c7-ae43-465c0a5e0d4a	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	4d687dc3-2b4a-4515-9e63-71d387f4a364	ASESOR_VENTAS	t	2026-08-04 18:00:11.775245+00	2026-08-04 18:00:12.135862+00
c7dedba7-347c-4695-88c7-411a0a80a182	f2f7656d-6fa4-4cfe-8c48-5ed1f318e999	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	4d687dc3-2b4a-4515-9e63-71d387f4a364	ASESOR_VENTAS	t	2026-08-04 18:00:11.790117+00	2026-08-04 18:00:12.151749+00
ec5b2c5c-236e-4ac3-b7c3-31a00b5877d5	b4966c3e-7431-49b3-9994-1214ca938847	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	4d687dc3-2b4a-4515-9e63-71d387f4a364	ASESOR_VENTAS	t	2026-08-04 18:00:11.8062+00	2026-08-04 18:00:12.170093+00
d6822acc-48e3-4b1d-a964-eef90f26fe1c	36b6836d-d07b-4f2d-823a-41cd44cf2b2f	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	4d687dc3-2b4a-4515-9e63-71d387f4a364	ASESOR_VENTAS	t	2026-08-04 18:00:11.82152+00	2026-08-04 18:00:12.186306+00
354cb134-2a40-47ec-a500-e05bccb54541	3bc3b0c0-0945-4950-b815-1cdb205ffa54	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	4d687dc3-2b4a-4515-9e63-71d387f4a364	ASESOR_VENTAS	t	2026-08-04 18:00:11.837114+00	2026-08-04 18:00:12.202495+00
ce6b7139-5d2a-4429-a11f-cb6237644d96	9b02705c-b1ff-44a5-88f0-ba573a298e72	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	46e5c5c8-4993-4237-ab0f-77165cd30f17	ASESOR_VENTAS	t	2026-08-04 18:00:11.852753+00	2026-08-04 18:00:12.219597+00
8c73e1ef-bf1c-456f-adc4-8e6e4ae57159	17d545a4-275c-4d65-aea3-33228c8410b6	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	46e5c5c8-4993-4237-ab0f-77165cd30f17	ASESOR_VENTAS	t	2026-08-04 18:00:11.869372+00	2026-08-04 18:00:12.236941+00
f6edc1f9-7a29-449d-b84f-c49cdb13e077	c9d2ab32-e323-4d00-b93a-f52e02f1e8e5	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	46e5c5c8-4993-4237-ab0f-77165cd30f17	ASESOR_VENTAS	t	2026-08-04 18:00:11.88418+00	2026-08-04 18:00:12.253395+00
e3f9c122-f817-4645-9d6c-57b8b009c68a	c4c53d50-4f3d-4dff-b6a4-b98e42516088	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	46e5c5c8-4993-4237-ab0f-77165cd30f17	ASESOR_VENTAS	t	2026-08-04 18:00:11.903668+00	2026-08-04 18:00:12.269474+00
3bf96702-7131-4c7e-b02b-10768ca73004	942d2963-eb2d-4bf4-b3c0-6eb2a00d74df	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	46e5c5c8-4993-4237-ab0f-77165cd30f17	ASESOR_VENTAS	t	2026-08-04 18:00:11.918374+00	2026-08-04 18:00:12.284688+00
d57a4d9e-dada-433a-a4ee-787d2be56e59	12f8681c-3da6-4209-ad9d-32b4c2366613	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	c275e6b2-de61-4e27-9516-f841da6e9800	ASESOR_VENTAS	t	2026-08-04 18:00:11.933943+00	2026-08-04 18:00:12.301963+00
15c96309-b594-4ecc-ad69-7c0a9c4d88de	4cef34e2-8cc7-46d5-a2f4-a4dabc7793ac	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	c275e6b2-de61-4e27-9516-f841da6e9800	ASESOR_VENTAS	t	2026-08-04 18:00:11.948944+00	2026-08-04 18:00:12.316991+00
3ce70f19-1223-4c08-a212-2baa91b99ec4	9dde47e9-9c89-4414-b170-73626d2f2937	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	c275e6b2-de61-4e27-9516-f841da6e9800	ASESOR_VENTAS	t	2026-08-04 18:00:11.965914+00	2026-08-04 18:00:12.333587+00
827c84ec-f274-4196-953b-b12cb929951b	b9894c6f-b0d7-4e2e-9f96-db7e10b1b3a3	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	c275e6b2-de61-4e27-9516-f841da6e9800	ASESOR_VENTAS	t	2026-08-04 18:00:11.98101+00	2026-08-04 18:00:12.351017+00
d2e1866b-a42f-48b5-9323-386c8f7d6d19	420dd2b1-043a-4945-b7bc-bb1a55bb771e	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	c275e6b2-de61-4e27-9516-f841da6e9800	ASESOR_VENTAS	t	2026-08-04 18:00:11.996655+00	2026-08-04 18:00:12.366922+00
7fa05f4e-5d05-4cab-a40a-aa4390e25d27	a77b679d-5b05-4ad2-b98d-70932943f29a	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	00b98ace-3899-4cfe-a9f6-0133e2be618e	ASESOR_VENTAS	t	2026-08-04 18:00:12.01334+00	2026-08-04 18:00:12.382685+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, company_id, full_name, email, password_hash, phone, role, global_role, is_active, supervisor_id, last_login_at, created_at, updated_at, deleted_at) FROM stdin;
07f55b5d-7899-4f3c-a60c-9c08f7a92620	\N	Humberto Benavides 	presidencia@fsperu.pro	$2b$10$Qb1WhcivD/UaJQMlAH1tceZXZt6S6PDZVfd2clBThE04rOPXI/Ik2	957770680	AGENCY_ADMIN	AGENCY_ADMIN	t	\N	\N	2026-08-05 15:40:12.867901+00	2026-08-05 15:40:12.867901+00	\N
3daeaa90-88ad-4362-a5d2-8df9af87f3c7	d5feda56-ad48-475e-bf41-3d74e16d0f9c	Admin Futura	admin@futura.pe	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ACCOUNT_ADMIN	\N	t	\N	\N	2026-08-04 18:00:11.515393+00	2026-08-04 18:00:11.515393+00	\N
7783419d-70e2-4ab7-8574-3792d5873827	d5feda56-ad48-475e-bf41-3d74e16d0f9c	Supervisor Futura	supervisor@futura.pe	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	SUPERVISOR_HUNTING	\N	t	\N	\N	2026-08-04 18:00:11.534317+00	2026-08-04 18:00:11.534317+00	\N
609ccae5-535a-4f0a-87ff-1b836c3cccd3	d5feda56-ad48-475e-bf41-3d74e16d0f9c	BO Futura	backoffice@futura.pe	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	BACKOFFICE	\N	t	\N	\N	2026-08-04 18:00:11.549414+00	2026-08-04 18:00:11.549414+00	\N
1d606ca3-7c73-4cbe-b56d-a8a25c7f6b2f	d5feda56-ad48-475e-bf41-3d74e16d0f9c	Hunter Futura	hunter@futura.pe	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	HUNTER	\N	t	\N	\N	2026-08-04 18:00:11.565564+00	2026-08-04 18:00:11.565564+00	\N
389d6c73-72ce-4fcc-9475-b1cef3ac7426	0a63ec4d-05db-46d2-aa4f-da10e59e10ad	Admin Novacore	admin@novacore.pe	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ACCOUNT_ADMIN	\N	t	\N	\N	2026-08-04 18:00:11.588162+00	2026-08-04 18:00:11.588162+00	\N
e0d56eac-f091-4419-8f19-fd666f4cda70	0a63ec4d-05db-46d2-aa4f-da10e59e10ad	Hunter Novacore	hunter@novacore.pe	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	HUNTER	\N	t	\N	\N	2026-08-04 18:00:11.604122+00	2026-08-04 18:00:11.604122+00	\N
fba83223-c1c4-4859-aa54-cd23e6f53953	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Admin FS	admin@fs.pe	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ACCOUNT_ADMIN	\N	t	\N	\N	2026-08-04 18:00:11.621062+00	2026-08-04 18:00:11.621062+00	\N
940de1f2-8222-41a3-a01a-044233252610	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Backoffice FS	backoffice@fs.pe	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	BACKOFFICE	\N	t	\N	\N	2026-08-04 18:00:11.637399+00	2026-08-04 18:00:11.637399+00	\N
241ccb2f-57a5-4d1e-b3be-c86e20df8da1	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Postventa FS	postventa@fs.pe	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	POSTVENTA	\N	t	\N	\N	2026-08-04 18:00:11.652748+00	2026-08-04 18:00:11.652748+00	\N
fd842e58-b0ac-4920-b313-9ef6301dd8eb	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Giovanni Figueroa	giovanni.figueroa@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-08-04 18:00:11.6841+00	2026-08-04 18:00:11.6841+00	\N
78207b54-5198-4a92-8d9d-3428186b163c	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Joselyn Rengifo	joselyn.rengifo@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-08-04 18:00:11.700729+00	2026-08-04 18:00:11.700729+00	\N
e30a588a-df71-4ea7-acdc-f8201a6fb6ce	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Edwin Roca	edwin.roca@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-08-04 18:00:11.716358+00	2026-08-04 18:00:11.716358+00	\N
662cc13f-cc0b-4a14-b5dd-54e2a2a80286	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	SubAgencia	subagencia@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-08-04 18:00:11.732862+00	2026-08-04 18:00:11.732862+00	\N
a85bbab8-0386-4873-a8a8-fb509be3247a	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	Asesor Prueba	asesor.test@fs.pe	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	fd842e58-b0ac-4920-b313-9ef6301dd8eb	\N	2026-08-04 18:00:11.668805+00	2026-08-04 18:00:12.054137+00	\N
77353bfe-41d8-4a3d-bcd2-056b1292f724	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	SHEYLA RIVERA	sheyla.rivera@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	fd842e58-b0ac-4920-b313-9ef6301dd8eb	\N	2026-08-04 18:00:11.750185+00	2026-08-04 18:00:12.110302+00	\N
4bba3e3b-53a2-47c7-ae43-465c0a5e0d4a	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	BRIGITH VILCA	brigith.vilca@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	fd842e58-b0ac-4920-b313-9ef6301dd8eb	\N	2026-08-04 18:00:11.765847+00	2026-08-04 18:00:12.126803+00	\N
f2f7656d-6fa4-4cfe-8c48-5ed1f318e999	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	IVAN OYOLA	ivan.oyola@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	fd842e58-b0ac-4920-b313-9ef6301dd8eb	\N	2026-08-04 18:00:11.782947+00	2026-08-04 18:00:12.143429+00	\N
b4966c3e-7431-49b3-9994-1214ca938847	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	NANCY CRISOSTOMO	nancy.crisostomo@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	fd842e58-b0ac-4920-b313-9ef6301dd8eb	\N	2026-08-04 18:00:11.798527+00	2026-08-04 18:00:12.160011+00	\N
36b6836d-d07b-4f2d-823a-41cd44cf2b2f	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	SUBAGENCIA (G)	subagencia.giovanni@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	fd842e58-b0ac-4920-b313-9ef6301dd8eb	\N	2026-08-04 18:00:11.814173+00	2026-08-04 18:00:12.177363+00	\N
3bc3b0c0-0945-4950-b815-1cdb205ffa54	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	GIOVANNI FIGUEROA (P)	giovanni.personal@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	fd842e58-b0ac-4920-b313-9ef6301dd8eb	\N	2026-08-04 18:00:11.829217+00	2026-08-04 18:00:12.193756+00	\N
9b02705c-b1ff-44a5-88f0-ba573a298e72	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	LESLY VARGAS	lesly.vargas@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	78207b54-5198-4a92-8d9d-3428186b163c	\N	2026-08-04 18:00:11.844612+00	2026-08-04 18:00:12.209646+00	\N
17d545a4-275c-4d65-aea3-33228c8410b6	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	WILLIAM SANTA CRUZ	william.santacruz@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	78207b54-5198-4a92-8d9d-3428186b163c	\N	2026-08-04 18:00:11.86134+00	2026-08-04 18:00:12.227005+00	\N
c9d2ab32-e323-4d00-b93a-f52e02f1e8e5	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	IVETTE PACHAS	ivette.pachas@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	78207b54-5198-4a92-8d9d-3428186b163c	\N	2026-08-04 18:00:11.876814+00	2026-08-04 18:00:12.244532+00	\N
c4c53d50-4f3d-4dff-b6a4-b98e42516088	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	HELLEN FLORES	hellen.flores@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	78207b54-5198-4a92-8d9d-3428186b163c	\N	2026-08-04 18:00:11.894606+00	2026-08-04 18:00:12.260417+00	\N
942d2963-eb2d-4bf4-b3c0-6eb2a00d74df	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	CARLOS ALVAREZ	carlos.alvarez@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	78207b54-5198-4a92-8d9d-3428186b163c	\N	2026-08-04 18:00:11.911127+00	2026-08-04 18:00:12.276481+00	\N
12f8681c-3da6-4209-ad9d-32b4c2366613	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	KATHERINE ZAPATA	katherine.zapata@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	e30a588a-df71-4ea7-acdc-f8201a6fb6ce	\N	2026-08-04 18:00:11.92688+00	2026-08-04 18:00:12.291601+00	\N
4cef34e2-8cc7-46d5-a2f4-a4dabc7793ac	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	DEYSI DIAZ	deysi.diaz@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	e30a588a-df71-4ea7-acdc-f8201a6fb6ce	\N	2026-08-04 18:00:11.941375+00	2026-08-04 18:00:12.308921+00	\N
9dde47e9-9c89-4414-b170-73626d2f2937	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	SUBAGENCIA (E)	subagencia.edwin@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	e30a588a-df71-4ea7-acdc-f8201a6fb6ce	\N	2026-08-04 18:00:11.956843+00	2026-08-04 18:00:12.323911+00	\N
b9894c6f-b0d7-4e2e-9f96-db7e10b1b3a3	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	REBECA BOZA	rebeca.boza@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	e30a588a-df71-4ea7-acdc-f8201a6fb6ce	\N	2026-08-04 18:00:11.97361+00	2026-08-04 18:00:12.34063+00	\N
420dd2b1-043a-4945-b7bc-bb1a55bb771e	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	MARCO PEREZ	marco.perez@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	e30a588a-df71-4ea7-acdc-f8201a6fb6ce	\N	2026-08-04 18:00:11.988474+00	2026-08-04 18:00:12.357933+00	\N
a77b679d-5b05-4ad2-b98d-70932943f29a	0fb6de52-18e0-4b47-9e46-8eef7345c3c2	PABLO SAENZ	pablo.saenz@conection-futura.com	$2b$10$veQhdYvIGQCb5/qVBnO/8.hHwa2RJVLydS8GF0Zl/6H3Qysl7ApD.	\N	ASESOR_VENTAS	\N	t	662cc13f-cc0b-4a14-b5dd-54e2a2a80286	\N	2026-08-04 18:00:12.005163+00	2026-08-04 18:00:12.373929+00	\N
2672abbf-e686-4148-9ac0-55e661e7458a	\N	Admin Sistema	admin@tuempresa.com	$2b$10$V3BwmkSgo4BlK7ZHaQDHn.Do7WqgkxAXd0Gj/M0uLYvGYWLXLFKr2	\N	AGENCY_ADMIN	AGENCY_ADMIN	t	\N	\N	2026-08-04 18:00:10.774826+00	2026-08-05 23:06:11.409199+00	\N
\.


--
-- Data for Name: ventas_fija; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventas_fija (id, opportunity_id, ruc, razon_social, representante_legal, dni_rrll, celular_rrll, correo_electronico, nombre_padres_rrll, fecha_nacimiento_rrll, lugar_nacimiento_rrll, tipo_domicilio, direccion_fiscal, direccion_instalacion, departamento, provincia, distrito, referencia, coordenadas_gps, tipo_tecnologia, tipo_play, velocidad, cargo_fijo_sin_igv, campana, adicionales, tipo_servicio, cantidad_lineas, tipo_movil, plano_url, observaciones, notas_postventa, created_at, updated_at) FROM stdin;
3cdb9561-b111-47df-bc37-ce9db5199ca2	0bba0448-eb44-4cb3-9ef0-73a9f570614e	12312523532	Servicios Médicos del Perú	Juan Perez Lopez	76676543	999888777	rafa.sanchez@conection-futura.com	Sanchez Garay / Cesar Rafael	2026-08-07	LIMA - LIMA - LIMA	Casa	Avenida Canaval y Moreyra 425, Limatambo - LURIGANCHO, LIMA, LIMA	Avenida Canaval y Moreyra 425, El Bosque	LIMA	LIMA	LIMA	Frente al parque	{"x": -12.082953071656533, "y": -77.03993683723598}	FTTH	1 Play Internet solo	400mbps	89.00	FTTH Regular	No aplica	Fija	\N	Alta	ISAJ78-1	aiosjfnmioasdfwse	\N	2026-08-04 20:43:13.658481+00	2026-08-04 20:43:13.658481+00
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
-- Name: opportunity_notes PK_abcd998df6dd905d42a6c595ac9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_notes
    ADD CONSTRAINT "PK_abcd998df6dd905d42a6c595ac9" PRIMARY KEY (id);


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
-- Name: opportunity_notes FK_08c9efe2ca0babf3abd6f9df9ab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_notes
    ADD CONSTRAINT "FK_08c9efe2ca0babf3abd6f9df9ab" FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id) ON DELETE CASCADE;


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
-- Name: opportunity_notes FK_8c7da163db843b7a78b52e6f527; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_notes
    ADD CONSTRAINT "FK_8c7da163db843b7a78b52e6f527" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


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

\unrestrict bTNUMTv87LIgdSsSsVPJi4oRHorzsLP6MOmD7MgBDhV6dn4AuFv6btAFkSy0RKf

