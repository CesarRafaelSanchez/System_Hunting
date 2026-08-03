--
-- PostgreSQL database dump
--

\restrict b6mcbhdchYyv6eJT9zQAmrQPPF0Y8fgDNjA8BbbKOntMMhGwJSpYiBQD4qw4QSa

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
ba6d2d21-41f3-449b-8a15-6d81f684aea1	Futura	futura	20111111111	t	HUNTING_EDIFICIOS	2026-07-31 23:49:07.766121+00	2026-07-31 23:49:07.766121+00
653143e1-f5e6-4e82-b59a-7835b1d56768	Novacore	novacore	20222222222	t	HUNTING_EDIFICIOS	2026-07-31 23:49:07.776295+00	2026-07-31 23:49:07.776295+00
8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	FS	fs	20333333333	t	VENTAS_B2B	2026-07-31 23:49:07.787216+00	2026-07-31 23:49:07.787216+00
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
00000000-0000-0000-0000-000000000002	Scraping	SCR	\N	t	2026-07-31 23:49:10.013591+00	2026-07-31 23:49:10.013591+00
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
c1e4a172-ad1d-4ef1-8b34-cf77eba45b97	HUNT-FUT-01	ba6d2d21-41f3-449b-8a15-6d81f684aea1	39b22e99-011b-4de1-9f59-35b47b8d7c27	00000000-0000-0000-0000-000000000002	ad4dac40-9f3c-4a04-a892-16a1c2fde467	e59de5f8-1147-4138-a5b3-a26bac6b3082	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	OPEN	\N	FUTURA	\N	2026-07-31 23:49:10.06+00	\N	\N	\N	2026-07-31 23:49:10.062812+00	2026-07-31 23:49:10.062812+00	\N	f	\N	\N
7d917821-2a90-47e9-8f43-4e0302cf9e33	HUNT-FUT-02	ba6d2d21-41f3-449b-8a15-6d81f684aea1	e8dee5f7-e216-4861-b28c-95e1cf24e2d4	00000000-0000-0000-0000-000000000002	ad4dac40-9f3c-4a04-a892-16a1c2fde467	e59de5f8-1147-4138-a5b3-a26bac6b3082	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	OPEN	\N	FUTURA	\N	2026-07-31 23:49:10.105+00	\N	\N	\N	2026-07-31 23:49:10.10667+00	2026-07-31 23:49:10.10667+00	\N	f	\N	\N
bbcb0bcf-cbe0-4acc-9b19-484039c03edc	HUNT-FUT-03	ba6d2d21-41f3-449b-8a15-6d81f684aea1	21a9e55b-efc0-400a-92d8-f29dfb2c1224	00000000-0000-0000-0000-000000000002	ad4dac40-9f3c-4a04-a892-16a1c2fde467	e59de5f8-1147-4138-a5b3-a26bac6b3082	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	OPEN	\N	FUTURA	\N	2026-07-31 23:49:10.144+00	\N	\N	\N	2026-07-31 23:49:10.145577+00	2026-07-31 23:49:10.145577+00	\N	f	\N	\N
0c7a0bc7-9221-4a0c-9a0f-ed6e41d5eb87	HUNT-FUT-04	ba6d2d21-41f3-449b-8a15-6d81f684aea1	32d402ed-abb0-4757-8522-221b2a2c20b8	00000000-0000-0000-0000-000000000002	ad4dac40-9f3c-4a04-a892-16a1c2fde467	e59de5f8-1147-4138-a5b3-a26bac6b3082	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	OPEN	\N	FUTURA	\N	2026-07-31 23:49:10.181+00	\N	\N	\N	2026-07-31 23:49:10.182368+00	2026-07-31 23:49:10.182368+00	\N	f	\N	\N
c36d18b8-e7a0-4e94-97ad-299d64c36504	HUNT-FUT-05	ba6d2d21-41f3-449b-8a15-6d81f684aea1	ae1821ee-a0ca-43a9-a8b9-5ce7abda29be	00000000-0000-0000-0000-000000000002	ad4dac40-9f3c-4a04-a892-16a1c2fde467	e59de5f8-1147-4138-a5b3-a26bac6b3082	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	OPEN	\N	FUTURA	\N	2026-07-31 23:49:10.219+00	\N	\N	\N	2026-07-31 23:49:10.220162+00	2026-07-31 23:49:10.220162+00	\N	f	\N	\N
a70dcbfb-9a42-4fc9-8a53-99b663d4f8c2	HUNT-NOV-01	653143e1-f5e6-4e82-b59a-7835b1d56768	81bdedef-6fb9-406e-8d18-00d4bc02c909	00000000-0000-0000-0000-000000000002	306921a5-d8fc-4679-9958-cf6748e5a104	1169b0bf-b68d-4f11-a6ab-7d51f8709262	a104f8b4-07cc-4ea2-b186-38cc6dc98088	a104f8b4-07cc-4ea2-b186-38cc6dc98088	OPEN	\N	NOVACORE	\N	2026-07-31 23:49:10.255+00	\N	\N	\N	2026-07-31 23:49:10.256821+00	2026-07-31 23:49:10.256821+00	\N	f	\N	\N
2fea4f35-57a3-49a6-ab9b-f0292177bcdc	HUNT-NOV-02	653143e1-f5e6-4e82-b59a-7835b1d56768	1e3687c7-114b-4a0c-96bf-be2e782536fc	00000000-0000-0000-0000-000000000002	306921a5-d8fc-4679-9958-cf6748e5a104	1169b0bf-b68d-4f11-a6ab-7d51f8709262	a104f8b4-07cc-4ea2-b186-38cc6dc98088	a104f8b4-07cc-4ea2-b186-38cc6dc98088	OPEN	\N	NOVACORE	\N	2026-07-31 23:49:10.296+00	\N	\N	\N	2026-07-31 23:49:10.297709+00	2026-07-31 23:49:10.297709+00	\N	f	\N	\N
e947875f-1c05-4660-aa68-986d319f9c9f	HUNT-NOV-03	653143e1-f5e6-4e82-b59a-7835b1d56768	4ca9c12f-ed5a-42be-8047-1590e6bdb94c	00000000-0000-0000-0000-000000000002	306921a5-d8fc-4679-9958-cf6748e5a104	1169b0bf-b68d-4f11-a6ab-7d51f8709262	a104f8b4-07cc-4ea2-b186-38cc6dc98088	a104f8b4-07cc-4ea2-b186-38cc6dc98088	OPEN	\N	NOVACORE	\N	2026-07-31 23:49:10.336+00	\N	\N	\N	2026-07-31 23:49:10.338082+00	2026-07-31 23:49:10.338082+00	\N	f	\N	\N
5986165a-091e-42d5-8205-25c2ed235b76	HUNT-NOV-04	653143e1-f5e6-4e82-b59a-7835b1d56768	e272c8dc-48ec-4cdc-bff7-00f14b4913a7	00000000-0000-0000-0000-000000000002	306921a5-d8fc-4679-9958-cf6748e5a104	1169b0bf-b68d-4f11-a6ab-7d51f8709262	a104f8b4-07cc-4ea2-b186-38cc6dc98088	a104f8b4-07cc-4ea2-b186-38cc6dc98088	OPEN	\N	NOVACORE	\N	2026-07-31 23:49:10.381+00	\N	\N	\N	2026-07-31 23:49:10.382669+00	2026-07-31 23:49:10.382669+00	\N	f	\N	\N
c23f8018-878b-4e0f-aceb-da693a8b17ed	HUNT-NOV-05	653143e1-f5e6-4e82-b59a-7835b1d56768	5e3d1d7f-c49f-49dc-9740-8dde54f0f5dc	00000000-0000-0000-0000-000000000002	306921a5-d8fc-4679-9958-cf6748e5a104	1169b0bf-b68d-4f11-a6ab-7d51f8709262	a104f8b4-07cc-4ea2-b186-38cc6dc98088	a104f8b4-07cc-4ea2-b186-38cc6dc98088	OPEN	\N	NOVACORE	\N	2026-07-31 23:49:10.434+00	\N	\N	\N	2026-07-31 23:49:10.436398+00	2026-07-31 23:49:10.436398+00	\N	f	\N	\N
233e04c9-6ec9-47b8-a58d-f0c5f3974ab1	VNT-FS-01	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	\N	00000000-0000-0000-0000-000000000002	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	73ff9b87-96e7-4ad2-a9c2-e28be65a609a	4985777b-90c6-4548-87cb-8b42a094a94c	4985777b-90c6-4548-87cb-8b42a094a94c	OPEN	\N	\N	\N	2026-07-31 23:49:10.455+00	\N	\N	\N	2026-07-31 23:49:10.456258+00	2026-07-31 23:49:10.456258+00	\N	f	\N	\N
823b9669-c764-4c66-b6bd-0ce8ea460c30	VNT-FS-02	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	\N	00000000-0000-0000-0000-000000000002	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	73ff9b87-96e7-4ad2-a9c2-e28be65a609a	4985777b-90c6-4548-87cb-8b42a094a94c	4985777b-90c6-4548-87cb-8b42a094a94c	OPEN	\N	\N	\N	2026-07-31 23:49:10.484+00	\N	\N	\N	2026-07-31 23:49:10.484715+00	2026-07-31 23:49:10.484715+00	\N	f	\N	\N
f86282d8-2eca-439f-9731-3b63c5d0ef44	VNT-FS-03	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	\N	00000000-0000-0000-0000-000000000002	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	73ff9b87-96e7-4ad2-a9c2-e28be65a609a	4985777b-90c6-4548-87cb-8b42a094a94c	4985777b-90c6-4548-87cb-8b42a094a94c	OPEN	\N	\N	\N	2026-07-31 23:49:10.498+00	\N	\N	\N	2026-07-31 23:49:10.499422+00	2026-07-31 23:49:10.499422+00	\N	f	\N	\N
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
e59de5f8-1147-4138-a5b3-a26bac6b3082	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Edificio Prospectado	PHU-FUTURA-S1	1	STANDARD	t	f	f	f	2026-07-31 23:49:07.810996+00	2026-07-31 23:49:07.810996+00
415e99ec-fafd-4258-890e-e6392bc9bff9	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Prospecto Aceptado / Trabajable	PHU-FUTURA-S2	2	STANDARD	f	f	f	f	2026-07-31 23:49:07.827983+00	2026-07-31 23:49:07.827983+00
0ad92866-9429-416a-ba2a-4a3257786bef	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Prospecto Rechazado / No Trabajable	PHU-FUTURA-S3	3	LOST	f	t	f	t	2026-07-31 23:49:07.84625+00	2026-07-31 23:49:07.84625+00
f724b226-5206-4689-8f89-570579d711a0	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Pendiente Envío de Formulario de Asignación	PHU-FUTURA-S4	4	STANDARD	f	f	f	f	2026-07-31 23:49:07.866713+00	2026-07-31 23:49:07.866713+00
20a75f77-7ac7-4ef5-8e17-adf089bdd0e7	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Formulario de Asignación/Reasignación Completado	PHU-FUTURA-S5	5	STANDARD	f	f	f	f	2026-07-31 23:49:07.887775+00	2026-07-31 23:49:07.887775+00
4c844114-68d3-4a8c-a63a-3f994f071fb9	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Validación Back Office	PHU-FUTURA-S6	6	STANDARD	f	f	f	f	2026-07-31 23:49:07.911844+00	2026-07-31 23:49:07.911844+00
2e28fd18-de93-4015-ae83-f87f518cde8b	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Solicitud de Asignación/Reasignación Enviada a WIN	PHU-FUTURA-S7	7	STANDARD	f	f	f	f	2026-07-31 23:49:07.93442+00	2026-07-31 23:49:07.93442+00
cc2b5058-a0d5-461f-abcc-a117d4dddb94	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Esperando Respuesta WIN	PHU-FUTURA-S8	8	STANDARD	f	f	f	f	2026-07-31 23:49:07.955274+00	2026-07-31 23:49:07.955274+00
2bf6b28a-f79a-487b-8ff1-4559d35d74f8	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Asignación Aprobada	PHU-FUTURA-S9	9	STANDARD	f	f	f	f	2026-07-31 23:49:07.977109+00	2026-07-31 23:49:07.977109+00
6c5651d1-d97e-4ed3-a5b4-5eab600aac35	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Asignación Rechazada	PHU-FUTURA-S10	10	STANDARD	f	f	f	f	2026-07-31 23:49:07.996325+00	2026-07-31 23:49:07.996325+00
78c10c61-17ba-4cd7-a147-e8e2e9f2f799	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Pendiente Reasignación	PHU-FUTURA-S11	11	STANDARD	f	f	f	f	2026-07-31 23:49:08.017291+00	2026-07-31 23:49:08.017291+00
ff550d82-b8cd-4df4-84f9-2009ddfd3ae4	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Pendiente Envío de Formulario Ficha de Datos	PHU-FUTURA-S12	12	STANDARD	f	f	f	f	2026-07-31 23:49:08.037858+00	2026-07-31 23:49:08.037858+00
e390c820-0af5-4a56-9889-0c0b2c9008c2	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Formulario de Ficha de Datos Completado	PHU-FUTURA-S13	13	STANDARD	f	f	f	f	2026-07-31 23:49:08.057611+00	2026-07-31 23:49:08.057611+00
150ddd8a-0e96-49e3-8977-478effab6143	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Validación Back Office 2	PHU-FUTURA-S14	14	STANDARD	f	f	f	f	2026-07-31 23:49:08.0738+00	2026-07-31 23:49:08.0738+00
f05fa73a-df2e-4c2b-a7bc-6596215aa45c	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Ficha de Datos Enviada a WIN	PHU-FUTURA-S15	15	STANDARD	f	f	f	f	2026-07-31 23:49:08.086103+00	2026-07-31 23:49:08.086103+00
23bcd4ca-41bf-4d1c-9afc-66397a10d36d	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Pendiente Inicio de Habilitación (construcción)	PHU-FUTURA-S16	16	STANDARD	f	f	f	f	2026-07-31 23:49:08.09636+00	2026-07-31 23:49:08.09636+00
e41bda56-a560-451c-82b9-ab61c39b48a6	ad4dac40-9f3c-4a04-a892-16a1c2fde467	En Habilitación Técnica	PHU-FUTURA-S17	17	STANDARD	f	f	f	f	2026-07-31 23:49:08.106288+00	2026-07-31 23:49:08.106288+00
742b1a70-06ea-468f-976f-4e5dafb2e423	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Standby por Accesos	PHU-FUTURA-S18	18	STANDARD	f	f	f	f	2026-07-31 23:49:08.115921+00	2026-07-31 23:49:08.115921+00
e3d3def5-394f-489b-8e82-1e01dfb8cf9f	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Habilitación Completa	PHU-FUTURA-S19	19	WON	f	t	t	f	2026-07-31 23:49:08.125398+00	2026-07-31 23:49:08.125398+00
d39f058b-f9f0-44b3-b9d4-8f60da69a3ad	ad4dac40-9f3c-4a04-a892-16a1c2fde467	Hunting Perdido/ No Recuperable	PHU-FUTURA-S20	20	LOST	f	t	f	t	2026-07-31 23:49:08.135934+00	2026-07-31 23:49:08.135934+00
1169b0bf-b68d-4f11-a6ab-7d51f8709262	306921a5-d8fc-4679-9958-cf6748e5a104	Edificio Prospectado	PHU-NOVACORE-S1	1	STANDARD	t	f	f	f	2026-07-31 23:49:08.154075+00	2026-07-31 23:49:08.154075+00
ca5bb303-6d69-4613-b19a-4da740cda9c5	306921a5-d8fc-4679-9958-cf6748e5a104	Prospecto Aceptado / Trabajable	PHU-NOVACORE-S2	2	STANDARD	f	f	f	f	2026-07-31 23:49:08.166819+00	2026-07-31 23:49:08.166819+00
f031c547-81e1-4af8-a4f3-8092a98b523c	306921a5-d8fc-4679-9958-cf6748e5a104	Prospecto Rechazado / No Trabajable	PHU-NOVACORE-S3	3	LOST	f	t	f	t	2026-07-31 23:49:08.177771+00	2026-07-31 23:49:08.177771+00
e5208cd7-a92c-40de-bf25-378cb07aa707	306921a5-d8fc-4679-9958-cf6748e5a104	Pendiente Envío de Formulario de Asignación	PHU-NOVACORE-S4	4	STANDARD	f	f	f	f	2026-07-31 23:49:08.187338+00	2026-07-31 23:49:08.187338+00
a5f44b8e-0b69-4f92-9a51-0e4440922605	306921a5-d8fc-4679-9958-cf6748e5a104	Formulario de Asignación/Reasignación Completado	PHU-NOVACORE-S5	5	STANDARD	f	f	f	f	2026-07-31 23:49:08.197295+00	2026-07-31 23:49:08.197295+00
56eda17c-ddaf-44b7-ac43-ef5335f59a79	306921a5-d8fc-4679-9958-cf6748e5a104	Validación Back Office	PHU-NOVACORE-S6	6	STANDARD	f	f	f	f	2026-07-31 23:49:08.206752+00	2026-07-31 23:49:08.206752+00
7592a419-a0f4-4077-a58b-7065ad3d6d82	306921a5-d8fc-4679-9958-cf6748e5a104	Solicitud de Asignación/Reasignación Enviada a WIN	PHU-NOVACORE-S7	7	STANDARD	f	f	f	f	2026-07-31 23:49:08.21796+00	2026-07-31 23:49:08.21796+00
459b48c1-39a4-4882-b2a0-f221ff54de08	306921a5-d8fc-4679-9958-cf6748e5a104	Esperando Respuesta WIN	PHU-NOVACORE-S8	8	STANDARD	f	f	f	f	2026-07-31 23:49:08.22809+00	2026-07-31 23:49:08.22809+00
c61198bf-1feb-47ed-8261-fe5bda762931	306921a5-d8fc-4679-9958-cf6748e5a104	Asignación Aprobada	PHU-NOVACORE-S9	9	STANDARD	f	f	f	f	2026-07-31 23:49:08.239481+00	2026-07-31 23:49:08.239481+00
ac016a20-480b-4b1f-9b4e-4ab8d2306777	306921a5-d8fc-4679-9958-cf6748e5a104	Asignación Rechazada	PHU-NOVACORE-S10	10	STANDARD	f	f	f	f	2026-07-31 23:49:08.250343+00	2026-07-31 23:49:08.250343+00
d8770ffd-35e0-489c-bf2a-51b5fe5bae14	306921a5-d8fc-4679-9958-cf6748e5a104	Pendiente Reasignación	PHU-NOVACORE-S11	11	STANDARD	f	f	f	f	2026-07-31 23:49:08.258679+00	2026-07-31 23:49:08.258679+00
b14c515f-c1a4-470f-a1c3-381d144e4ec2	306921a5-d8fc-4679-9958-cf6748e5a104	Pendiente Envío de Formulario Ficha de Datos	PHU-NOVACORE-S12	12	STANDARD	f	f	f	f	2026-07-31 23:49:08.266267+00	2026-07-31 23:49:08.266267+00
6603a04e-a5f4-4dc6-8539-2edbc4dd3768	306921a5-d8fc-4679-9958-cf6748e5a104	Formulario de Ficha de Datos Completado	PHU-NOVACORE-S13	13	STANDARD	f	f	f	f	2026-07-31 23:49:08.273567+00	2026-07-31 23:49:08.273567+00
2066aab0-f5d3-44b1-acf0-f92eb7d69348	306921a5-d8fc-4679-9958-cf6748e5a104	Validación Back Office 2	PHU-NOVACORE-S14	14	STANDARD	f	f	f	f	2026-07-31 23:49:08.280343+00	2026-07-31 23:49:08.280343+00
eb028d8e-8694-4473-94ba-0eaa59ec4a2d	306921a5-d8fc-4679-9958-cf6748e5a104	Ficha de Datos Enviada a WIN	PHU-NOVACORE-S15	15	STANDARD	f	f	f	f	2026-07-31 23:49:08.287359+00	2026-07-31 23:49:08.287359+00
ced90031-20b8-4ddf-8838-2073e8c7927a	306921a5-d8fc-4679-9958-cf6748e5a104	Pendiente Inicio de Habilitación (construcción)	PHU-NOVACORE-S16	16	STANDARD	f	f	f	f	2026-07-31 23:49:08.295377+00	2026-07-31 23:49:08.295377+00
d93f0400-6f9f-45bf-82cc-b3c034da3c5c	306921a5-d8fc-4679-9958-cf6748e5a104	En Habilitación Técnica	PHU-NOVACORE-S17	17	STANDARD	f	f	f	f	2026-07-31 23:49:08.303406+00	2026-07-31 23:49:08.303406+00
bc1d6213-6edf-436b-858a-ce42e6989560	306921a5-d8fc-4679-9958-cf6748e5a104	Standby por Accesos	PHU-NOVACORE-S18	18	STANDARD	f	f	f	f	2026-07-31 23:49:08.309741+00	2026-07-31 23:49:08.309741+00
1b9caa55-79d0-492d-9c81-39611c1ef4dd	306921a5-d8fc-4679-9958-cf6748e5a104	Habilitación Completa	PHU-NOVACORE-S19	19	WON	f	t	t	f	2026-07-31 23:49:08.316491+00	2026-07-31 23:49:08.316491+00
9748c5ec-8d37-4821-adb7-48616f748c31	306921a5-d8fc-4679-9958-cf6748e5a104	Hunting Perdido/ No Recuperable	PHU-NOVACORE-S20	20	LOST	f	t	f	t	2026-07-31 23:49:08.324367+00	2026-07-31 23:49:08.324367+00
73ff9b87-96e7-4ad2-a9c2-e28be65a609a	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Lead	PVB-FS-S1	1	STANDARD	t	f	f	f	2026-07-31 23:49:08.338533+00	2026-07-31 23:49:08.338533+00
e5ad9aba-8905-4611-a48b-b659c21f7b5c	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Sin Factibilidad 1	PVB-FS-S2	2	STANDARD	f	f	f	f	2026-07-31 23:49:08.34506+00	2026-07-31 23:49:08.34506+00
edc97165-f044-4c67-8fab-2ebb89099c23	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	25% Propuesta Enviada	PVB-FS-S3	3	STANDARD	f	f	f	f	2026-07-31 23:49:08.351673+00	2026-07-31 23:49:08.351673+00
bafece54-c35b-4617-bae4-31a9e585aaf0	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	SEC Creada	PVB-FS-S4	4	STANDARD	f	f	f	f	2026-07-31 23:49:08.358447+00	2026-07-31 23:49:08.358447+00
ea395ffe-1923-40a3-8eba-9e4871d34b6d	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Rechazo Oferta	PVB-FS-S5	5	LOST	f	t	f	t	2026-07-31 23:49:08.365243+00	2026-07-31 23:49:08.365243+00
212d795b-81e7-40f0-9eee-e61d8fd309d5	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	50% Propuesta Aceptada	PVB-FS-S6	6	STANDARD	f	f	f	f	2026-07-31 23:49:08.371975+00	2026-07-31 23:49:08.371975+00
286cabb9-52b0-49f1-817f-60b595244d71	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Llamada Validación	PVB-FS-S7	7	STANDARD	f	f	f	f	2026-07-31 23:49:08.378479+00	2026-07-31 23:49:08.378479+00
3377ff68-42c5-4a53-b035-8f4e9928ec9a	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	75% Agendada	PVB-FS-S8	8	STANDARD	f	f	f	f	2026-07-31 23:49:08.384816+00	2026-07-31 23:49:08.384816+00
50e77cd6-1166-4371-82e4-4ed2b48fd904	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	SOT Creada	PVB-FS-S9	9	STANDARD	f	f	f	f	2026-07-31 23:49:08.394502+00	2026-07-31 23:49:08.394502+00
4accdb77-76d3-4702-856e-bf838de27402	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Confirmación Visita	PVB-FS-S10	10	STANDARD	f	f	f	f	2026-07-31 23:49:08.401385+00	2026-07-31 23:49:08.401385+00
4d449c58-1583-4fe7-8158-fbc8b36cde35	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Técnico no Asiste	PVB-FS-S11	11	STANDARD	f	f	f	f	2026-07-31 23:49:08.40845+00	2026-07-31 23:49:08.40845+00
ce570669-0efb-488c-8330-9d39c2cf1a61	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Cliente no Contesta	PVB-FS-S12	12	STANDARD	f	f	f	f	2026-07-31 23:49:08.4152+00	2026-07-31 23:49:08.4152+00
9ada21d5-ebc6-4ec7-9e9e-741848aa9679	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Sin Factibilidad	PVB-FS-S13	13	LOST	f	t	f	t	2026-07-31 23:49:08.422085+00	2026-07-31 23:49:08.422085+00
b7395d2f-1b20-4b24-9617-95212c1ddb6b	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Instalación Incompleta	PVB-FS-S14	14	STANDARD	f	f	f	f	2026-07-31 23:49:08.428865+00	2026-07-31 23:49:08.428865+00
5a79288a-0be5-4cd8-a461-29d4b314d616	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	100% Instalación Completada	PVB-FS-S15	15	STANDARD	f	f	f	f	2026-07-31 23:49:08.43569+00	2026-07-31 23:49:08.43569+00
1b958903-b65b-48d6-aef7-a9e99111a30a	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Llamada de Control	PVB-FS-S16	16	STANDARD	f	f	f	f	2026-07-31 23:49:08.442376+00	2026-07-31 23:49:08.442376+00
fa881e74-bd7f-4036-bd36-9e3b499f03ba	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Llamada Postventa	PVB-FS-S17	17	STANDARD	f	f	f	f	2026-07-31 23:49:08.449458+00	2026-07-31 23:49:08.449458+00
769c10a3-f569-4221-bff3-76a779c97b3d	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Recibo 1	PVB-FS-S18	18	STANDARD	f	f	f	f	2026-07-31 23:49:08.456354+00	2026-07-31 23:49:08.456354+00
32afc630-5774-4b8d-b3d9-11a83fb5ef0a	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Recibo 2	PVB-FS-S19	19	STANDARD	f	f	f	f	2026-07-31 23:49:08.463557+00	2026-07-31 23:49:08.463557+00
c008dbae-8a74-4633-bb7b-5e441cacda0d	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Recibo 3	PVB-FS-S20	20	WON	f	t	t	f	2026-07-31 23:49:08.470222+00	2026-07-31 23:49:08.470222+00
b8103901-5a48-45bf-8339-cc4cc03002e0	6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Baja de Cliente	PVB-FS-S21	21	LOST	f	t	f	t	2026-07-31 23:49:08.477159+00	2026-07-31 23:49:08.477159+00
\.


--
-- Data for Name: pipelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipelines (id, name, code, description, is_active, company_id, created_at, updated_at) FROM stdin;
ad4dac40-9f3c-4a04-a892-16a1c2fde467	Pipeline Futura	PHU-FUTURA	\N	t	ba6d2d21-41f3-449b-8a15-6d81f684aea1	2026-07-31 23:49:07.798318+00	2026-07-31 23:49:07.798318+00
306921a5-d8fc-4679-9958-cf6748e5a104	Pipeline Novacore	PHU-NOVACORE	\N	t	653143e1-f5e6-4e82-b59a-7835b1d56768	2026-07-31 23:49:08.145534+00	2026-07-31 23:49:08.145534+00
6cfc44e1-cba3-4bce-9531-68bfdcaa21b6	Pipeline FS	PVB-FS	\N	t	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	2026-07-31 23:49:08.331987+00	2026-07-31 23:49:08.331987+00
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
39b22e99-011b-4de1-9f59-35b47b8d7c27	ba6d2d21-41f3-449b-8a15-6d81f684aea1	Predio Futura 1	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	201	\N	1	0	0	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 23:49:10.036253+00	2026-07-31 23:49:10.036253+00	\N
e8dee5f7-e216-4861-b28c-95e1cf24e2d4	ba6d2d21-41f3-449b-8a15-6d81f684aea1	Predio Futura 2	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	202	\N	1	0	0	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 23:49:10.08904+00	2026-07-31 23:49:10.08904+00	\N
21a9e55b-efc0-400a-92d8-f29dfb2c1224	ba6d2d21-41f3-449b-8a15-6d81f684aea1	Predio Futura 3	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	203	\N	1	0	0	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 23:49:10.126809+00	2026-07-31 23:49:10.126809+00	\N
32d402ed-abb0-4757-8522-221b2a2c20b8	ba6d2d21-41f3-449b-8a15-6d81f684aea1	Predio Futura 4	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	204	\N	1	0	0	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 23:49:10.165239+00	2026-07-31 23:49:10.165239+00	\N
ae1821ee-a0ca-43a9-a8b9-5ce7abda29be	ba6d2d21-41f3-449b-8a15-6d81f684aea1	Predio Futura 5	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	205	\N	1	0	0	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 23:49:10.202026+00	2026-07-31 23:49:10.202026+00	\N
81bdedef-6fb9-406e-8d18-00d4bc02c909	653143e1-f5e6-4e82-b59a-7835b1d56768	Predio Novacore 1	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	201	\N	1	0	0	a104f8b4-07cc-4ea2-b186-38cc6dc98088	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 23:49:10.239625+00	2026-07-31 23:49:10.239625+00	\N
1e3687c7-114b-4a0c-96bf-be2e782536fc	653143e1-f5e6-4e82-b59a-7835b1d56768	Predio Novacore 2	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	202	\N	1	0	0	a104f8b4-07cc-4ea2-b186-38cc6dc98088	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 23:49:10.277874+00	2026-07-31 23:49:10.277874+00	\N
4ca9c12f-ed5a-42be-8047-1590e6bdb94c	653143e1-f5e6-4e82-b59a-7835b1d56768	Predio Novacore 3	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	203	\N	1	0	0	a104f8b4-07cc-4ea2-b186-38cc6dc98088	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 23:49:10.318322+00	2026-07-31 23:49:10.318322+00	\N
e272c8dc-48ec-4cdc-bff7-00f14b4913a7	653143e1-f5e6-4e82-b59a-7835b1d56768	Predio Novacore 4	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	204	\N	1	0	0	a104f8b4-07cc-4ea2-b186-38cc6dc98088	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 23:49:10.360598+00	2026-07-31 23:49:10.360598+00	\N
5e3d1d7f-c49f-49dc-9740-8dde54f0f5dc	653143e1-f5e6-4e82-b59a-7835b1d56768	Predio Novacore 5	\N	\N	\N	Residencial	Scraping	A	Construido	\N	\N	\N	\N	Sí	\N	\N	Lima	Lima	44444444-4444-4444-4444-444444444443	\N	\N	Avenida	El Sol	205	\N	1	0	0	a104f8b4-07cc-4ea2-b186-38cc6dc98088	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-07-31 23:49:10.410058+00	2026-07-31 23:49:10.410058+00	\N
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
8b5d4750-d4ba-4ebd-acea-2dab0e30d81c	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Equipo Giovanni Figueroa	fa02731f-020c-4832-b872-1c119ac77852	t	2026-07-31 23:49:09.321921+00	2026-07-31 23:49:09.321921+00
545a2199-40b4-485e-bccd-6a8468f8e806	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Equipo Joselyn Rengifo	185654fe-dbca-412f-8b49-98e2e9c1cc16	t	2026-07-31 23:49:09.340595+00	2026-07-31 23:49:09.340595+00
f735f93c-dd78-4317-b69c-c85b663f6306	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Equipo Edwin Roca	24e30457-f1fd-4921-bdb9-1e8a507cd200	t	2026-07-31 23:49:09.356241+00	2026-07-31 23:49:09.356241+00
526a693c-72bf-4990-8ab8-3ff078ea2b7b	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Equipo SubAgencia	13b1e862-d061-41b1-8864-d3c2c228948f	t	2026-07-31 23:49:09.371155+00	2026-07-31 23:49:09.371155+00
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
db56746b-25b8-4555-9077-203f6136e23c	7d775774-4a47-4ef3-832a-f03d420cda41	ba6d2d21-41f3-449b-8a15-6d81f684aea1	\N	ACCOUNT_ADMIN	t	2026-07-31 23:49:08.493149+00	2026-07-31 23:49:08.493149+00
36d1f9eb-6b08-4cf8-92de-bab611384668	f75136e6-a165-4a1e-b8ab-8efde418bdea	ba6d2d21-41f3-449b-8a15-6d81f684aea1	\N	SUPERVISOR_HUNTING	t	2026-07-31 23:49:08.508349+00	2026-07-31 23:49:08.508349+00
ec45621c-521d-494c-917b-b08e6177176f	c0044e04-186d-44a2-9d89-d291f5553b45	ba6d2d21-41f3-449b-8a15-6d81f684aea1	\N	BACKOFFICE	t	2026-07-31 23:49:08.524047+00	2026-07-31 23:49:08.524047+00
5539162f-c17e-4ae0-b823-dc94e6e5abb6	f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	ba6d2d21-41f3-449b-8a15-6d81f684aea1	\N	HUNTER	t	2026-07-31 23:49:08.545734+00	2026-07-31 23:49:08.545734+00
876a81c3-7bf9-4f1f-acdb-365ae9ab1ad1	1f83208a-3d58-4026-bf0d-81c8a88c0bfa	653143e1-f5e6-4e82-b59a-7835b1d56768	\N	ACCOUNT_ADMIN	t	2026-07-31 23:49:08.566822+00	2026-07-31 23:49:08.566822+00
abc9470d-3453-41d6-a4cd-d3a587640ef7	a104f8b4-07cc-4ea2-b186-38cc6dc98088	653143e1-f5e6-4e82-b59a-7835b1d56768	\N	HUNTER	t	2026-07-31 23:49:08.586338+00	2026-07-31 23:49:08.586338+00
805ead99-ad7e-45b2-b0a1-b31ec933b2ac	d9c843ad-48b1-4735-b4a3-4cf07084b9e5	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	\N	ACCOUNT_ADMIN	t	2026-07-31 23:49:08.606291+00	2026-07-31 23:49:08.606291+00
82168b91-1f8c-44fe-8f89-00fe1f25ff32	16efe104-28cc-4d76-a8db-1d9fb9cdcbe9	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	\N	BACKOFFICE	t	2026-07-31 23:49:08.628355+00	2026-07-31 23:49:08.628355+00
419abaa0-5853-40eb-ab6c-efc2b1c9d90d	102d04a8-b6de-48fc-82cc-e7d3bc91705d	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	\N	POSTVENTA	t	2026-07-31 23:49:08.650215+00	2026-07-31 23:49:08.650215+00
d996d186-5b04-4b4e-82bb-e7b44074a760	4985777b-90c6-4548-87cb-8b42a094a94c	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	\N	ASESOR_VENTAS	t	2026-07-31 23:49:08.669519+00	2026-07-31 23:49:08.669519+00
d0a6e9f0-2d12-4100-a429-b58b03f23a30	fa02731f-020c-4832-b872-1c119ac77852	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	8b5d4750-d4ba-4ebd-acea-2dab0e30d81c	SUPERVISOR_VENTAS	t	2026-07-31 23:49:08.695592+00	2026-07-31 23:49:09.392849+00
859e62d7-fac4-4af8-bf47-207473f1798e	185654fe-dbca-412f-8b49-98e2e9c1cc16	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	545a2199-40b4-485e-bccd-6a8468f8e806	SUPERVISOR_VENTAS	t	2026-07-31 23:49:08.72193+00	2026-07-31 23:49:09.412625+00
c70fbec8-7e7f-4385-9d71-3f7342c35af8	24e30457-f1fd-4921-bdb9-1e8a507cd200	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	f735f93c-dd78-4317-b69c-c85b663f6306	SUPERVISOR_VENTAS	t	2026-07-31 23:49:08.751725+00	2026-07-31 23:49:09.433769+00
2b3a3277-0d05-40a0-a338-80a397c0bf24	13b1e862-d061-41b1-8864-d3c2c228948f	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	526a693c-72bf-4990-8ab8-3ff078ea2b7b	SUPERVISOR_VENTAS	t	2026-07-31 23:49:08.776232+00	2026-07-31 23:49:09.452828+00
aafe7378-5740-4134-8ed6-a8ad72c73854	3c552a33-3937-4832-97a2-d613663d4c33	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	8b5d4750-d4ba-4ebd-acea-2dab0e30d81c	ASESOR_VENTAS	t	2026-07-31 23:49:08.800082+00	2026-07-31 23:49:09.488386+00
7d608201-6a50-4d88-a0ac-d18bb8933b4e	78946f97-da2e-4645-86b8-db77ed6760a9	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	8b5d4750-d4ba-4ebd-acea-2dab0e30d81c	ASESOR_VENTAS	t	2026-07-31 23:49:08.823372+00	2026-07-31 23:49:09.524213+00
9145c3dc-e093-437f-bcae-6ca69da747d0	ee019d99-3b5e-44ea-9e74-a0e7c6eb66f5	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	8b5d4750-d4ba-4ebd-acea-2dab0e30d81c	ASESOR_VENTAS	t	2026-07-31 23:49:08.848492+00	2026-07-31 23:49:09.562418+00
174567e4-e7f4-40e4-86d0-45ddd7b42fc0	44318c40-7963-4512-a94c-8b7a45a83033	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	8b5d4750-d4ba-4ebd-acea-2dab0e30d81c	ASESOR_VENTAS	t	2026-07-31 23:49:08.873078+00	2026-07-31 23:49:09.596437+00
724463ea-030e-4e4c-b540-d2f2126f021a	5c8c1344-ada2-492a-9e05-08d60a2a83ba	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	8b5d4750-d4ba-4ebd-acea-2dab0e30d81c	ASESOR_VENTAS	t	2026-07-31 23:49:08.901125+00	2026-07-31 23:49:09.62873+00
dab6e506-7cc1-42cd-aba4-68dab9923f7f	c33fa6ba-b918-48a7-abfc-a214f58aee81	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	8b5d4750-d4ba-4ebd-acea-2dab0e30d81c	ASESOR_VENTAS	t	2026-07-31 23:49:08.933573+00	2026-07-31 23:49:09.667386+00
f8a4fb62-73d3-4f25-9212-bf250d7964f1	52b55a7d-13c8-4237-9ba7-6f1006daeb27	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	545a2199-40b4-485e-bccd-6a8468f8e806	ASESOR_VENTAS	t	2026-07-31 23:49:08.964344+00	2026-07-31 23:49:09.737497+00
33d17cee-15c2-4c78-8c9b-2157d77c8449	88bb956a-3bbb-4296-bf67-5e428f688b58	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	545a2199-40b4-485e-bccd-6a8468f8e806	ASESOR_VENTAS	t	2026-07-31 23:49:08.996001+00	2026-07-31 23:49:09.793617+00
3f96406a-2a7a-4c7f-9572-96ee0900a039	cdec50b1-4f89-4ca4-a557-35d98bd68238	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	545a2199-40b4-485e-bccd-6a8468f8e806	ASESOR_VENTAS	t	2026-07-31 23:49:09.027805+00	2026-07-31 23:49:09.817588+00
a6604277-77e0-4315-8b59-cf88a86ec529	85335c6c-e6c9-400b-9020-f159522c906f	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	545a2199-40b4-485e-bccd-6a8468f8e806	ASESOR_VENTAS	t	2026-07-31 23:49:09.066213+00	2026-07-31 23:49:09.835059+00
11b57dce-e230-4404-b00a-6419e747567f	3d2cf643-a16c-4604-8949-c968a43c80ad	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	545a2199-40b4-485e-bccd-6a8468f8e806	ASESOR_VENTAS	t	2026-07-31 23:49:09.104765+00	2026-07-31 23:49:09.852653+00
e7f63e30-37f0-46f4-95b6-31b1e7081c53	b8838902-a6ff-4f21-bfb0-b029f0fc6c3c	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	f735f93c-dd78-4317-b69c-c85b663f6306	ASESOR_VENTAS	t	2026-07-31 23:49:09.13919+00	2026-07-31 23:49:09.872205+00
6408ca0a-cc59-469b-ad7b-cddd94969099	14ea290d-5385-4f1b-ac5d-87d7f4ac4be8	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	f735f93c-dd78-4317-b69c-c85b663f6306	ASESOR_VENTAS	t	2026-07-31 23:49:09.169661+00	2026-07-31 23:49:09.892098+00
b606a5f5-5742-41fb-b3f5-10da0dc1d9aa	7d6805e7-20c5-4251-9369-16f56021fb6c	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	f735f93c-dd78-4317-b69c-c85b663f6306	ASESOR_VENTAS	t	2026-07-31 23:49:09.202125+00	2026-07-31 23:49:09.911413+00
5ddcb032-e74a-4464-9de9-e9f1b68c13a6	11a9644f-8356-4a79-9e1c-c5e615e534cd	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	f735f93c-dd78-4317-b69c-c85b663f6306	ASESOR_VENTAS	t	2026-07-31 23:49:09.2389+00	2026-07-31 23:49:09.930869+00
3109830d-9207-409c-abed-da173a7abd28	f7ada3fd-fee1-42cb-90ce-b0d40a31e529	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	f735f93c-dd78-4317-b69c-c85b663f6306	ASESOR_VENTAS	t	2026-07-31 23:49:09.272199+00	2026-07-31 23:49:09.95045+00
075ea9e7-56c1-4cd1-a7d3-ee3a932d798f	ba350bf2-4e1d-455b-a636-4c4649e590f7	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	526a693c-72bf-4990-8ab8-3ff078ea2b7b	ASESOR_VENTAS	t	2026-07-31 23:49:09.303257+00	2026-07-31 23:49:09.975262+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, company_id, full_name, email, password_hash, phone, role, global_role, is_active, supervisor_id, last_login_at, created_at, updated_at, deleted_at) FROM stdin;
b69b80c1-99c2-458e-818b-5ff15088c8f2	\N	Admin Sistema	admin@tuempresa.com	$2b$10$EbyKHSS0KUlofKZ3x/USx.fKo6KgSykOJJOsA87T7PRt4qyU9lX7i	\N	AGENCY_ADMIN	AGENCY_ADMIN	t	\N	\N	2026-07-31 23:49:07.526806+00	2026-07-31 23:49:07.740975+00	\N
7d775774-4a47-4ef3-832a-f03d420cda41	ba6d2d21-41f3-449b-8a15-6d81f684aea1	Admin Futura	admin@futura.pe	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ACCOUNT_ADMIN	\N	t	\N	\N	2026-07-31 23:49:08.484639+00	2026-07-31 23:49:08.484639+00	\N
f75136e6-a165-4a1e-b8ab-8efde418bdea	ba6d2d21-41f3-449b-8a15-6d81f684aea1	Supervisor Futura	supervisor@futura.pe	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	SUPERVISOR_HUNTING	\N	t	\N	\N	2026-07-31 23:49:08.501265+00	2026-07-31 23:49:08.501265+00	\N
c0044e04-186d-44a2-9d89-d291f5553b45	ba6d2d21-41f3-449b-8a15-6d81f684aea1	BO Futura	backoffice@futura.pe	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	BACKOFFICE	\N	t	\N	\N	2026-07-31 23:49:08.515621+00	2026-07-31 23:49:08.515621+00	\N
f63c3c5f-f5a1-4fcd-8b14-b1ac6ebfa190	ba6d2d21-41f3-449b-8a15-6d81f684aea1	Hunter Futura	hunter@futura.pe	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	HUNTER	\N	t	\N	\N	2026-07-31 23:49:08.534121+00	2026-07-31 23:49:08.534121+00	\N
1f83208a-3d58-4026-bf0d-81c8a88c0bfa	653143e1-f5e6-4e82-b59a-7835b1d56768	Admin Novacore	admin@novacore.pe	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ACCOUNT_ADMIN	\N	t	\N	\N	2026-07-31 23:49:08.556789+00	2026-07-31 23:49:08.556789+00	\N
a104f8b4-07cc-4ea2-b186-38cc6dc98088	653143e1-f5e6-4e82-b59a-7835b1d56768	Hunter Novacore	hunter@novacore.pe	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	HUNTER	\N	t	\N	\N	2026-07-31 23:49:08.576629+00	2026-07-31 23:49:08.576629+00	\N
d9c843ad-48b1-4735-b4a3-4cf07084b9e5	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Admin FS	admin@fs.pe	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ACCOUNT_ADMIN	\N	t	\N	\N	2026-07-31 23:49:08.596325+00	2026-07-31 23:49:08.596325+00	\N
16efe104-28cc-4d76-a8db-1d9fb9cdcbe9	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Backoffice FS	backoffice@fs.pe	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	BACKOFFICE	\N	t	\N	\N	2026-07-31 23:49:08.616467+00	2026-07-31 23:49:08.616467+00	\N
102d04a8-b6de-48fc-82cc-e7d3bc91705d	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Postventa FS	postventa@fs.pe	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	POSTVENTA	\N	t	\N	\N	2026-07-31 23:49:08.640239+00	2026-07-31 23:49:08.640239+00	\N
4985777b-90c6-4548-87cb-8b42a094a94c	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Asesor Prueba	asesor.test@fs.pe	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	\N	\N	2026-07-31 23:49:08.659491+00	2026-07-31 23:49:08.659491+00	\N
fa02731f-020c-4832-b872-1c119ac77852	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Giovanni Figueroa	giovanni.figueroa@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-07-31 23:49:08.67955+00	2026-07-31 23:49:08.67955+00	\N
185654fe-dbca-412f-8b49-98e2e9c1cc16	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Joselyn Rengifo	joselyn.rengifo@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-07-31 23:49:08.709922+00	2026-07-31 23:49:08.709922+00	\N
24e30457-f1fd-4921-bdb9-1e8a507cd200	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	Edwin Roca	edwin.roca@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-07-31 23:49:08.735547+00	2026-07-31 23:49:08.735547+00	\N
13b1e862-d061-41b1-8864-d3c2c228948f	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	SubAgencia	subagencia@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	SUPERVISOR_VENTAS	\N	t	\N	\N	2026-07-31 23:49:08.763991+00	2026-07-31 23:49:08.763991+00	\N
3c552a33-3937-4832-97a2-d613663d4c33	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	SHEYLA RIVERA	sheyla.rivera@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	fa02731f-020c-4832-b872-1c119ac77852	\N	2026-07-31 23:49:08.788373+00	2026-07-31 23:49:09.468806+00	\N
78946f97-da2e-4645-86b8-db77ed6760a9	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	BRIGITH VILCA	brigith.vilca@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	fa02731f-020c-4832-b872-1c119ac77852	\N	2026-07-31 23:49:08.812005+00	2026-07-31 23:49:09.504359+00	\N
ee019d99-3b5e-44ea-9e74-a0e7c6eb66f5	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	IVAN OYOLA	ivan.oyola@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	fa02731f-020c-4832-b872-1c119ac77852	\N	2026-07-31 23:49:08.834589+00	2026-07-31 23:49:09.540496+00	\N
44318c40-7963-4512-a94c-8b7a45a83033	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	NANCY CRISOSTOMO	nancy.crisostomo@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	fa02731f-020c-4832-b872-1c119ac77852	\N	2026-07-31 23:49:08.860555+00	2026-07-31 23:49:09.578484+00	\N
5c8c1344-ada2-492a-9e05-08d60a2a83ba	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	SUBAGENCIA (G)	subagencia.giovanni@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	fa02731f-020c-4832-b872-1c119ac77852	\N	2026-07-31 23:49:08.888727+00	2026-07-31 23:49:09.610936+00	\N
c33fa6ba-b918-48a7-abfc-a214f58aee81	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	GIOVANNI FIGUEROA (P)	giovanni.personal@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	fa02731f-020c-4832-b872-1c119ac77852	\N	2026-07-31 23:49:08.916715+00	2026-07-31 23:49:09.644306+00	\N
52b55a7d-13c8-4237-9ba7-6f1006daeb27	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	LESLY VARGAS	lesly.vargas@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	185654fe-dbca-412f-8b49-98e2e9c1cc16	\N	2026-07-31 23:49:08.948898+00	2026-07-31 23:49:09.696369+00	\N
88bb956a-3bbb-4296-bf67-5e428f688b58	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	WILLIAM SANTA CRUZ	william.santacruz@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	185654fe-dbca-412f-8b49-98e2e9c1cc16	\N	2026-07-31 23:49:08.98105+00	2026-07-31 23:49:09.760489+00	\N
cdec50b1-4f89-4ca4-a557-35d98bd68238	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	IVETTE PACHAS	ivette.pachas@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	185654fe-dbca-412f-8b49-98e2e9c1cc16	\N	2026-07-31 23:49:09.012388+00	2026-07-31 23:49:09.806432+00	\N
85335c6c-e6c9-400b-9020-f159522c906f	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	HELLEN FLORES	hellen.flores@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	185654fe-dbca-412f-8b49-98e2e9c1cc16	\N	2026-07-31 23:49:09.046549+00	2026-07-31 23:49:09.825507+00	\N
3d2cf643-a16c-4604-8949-c968a43c80ad	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	CARLOS ALVAREZ	carlos.alvarez@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	185654fe-dbca-412f-8b49-98e2e9c1cc16	\N	2026-07-31 23:49:09.087955+00	2026-07-31 23:49:09.843021+00	\N
b8838902-a6ff-4f21-bfb0-b029f0fc6c3c	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	KATHERINE ZAPATA	katherine.zapata@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	24e30457-f1fd-4921-bdb9-1e8a507cd200	\N	2026-07-31 23:49:09.121369+00	2026-07-31 23:49:09.860763+00	\N
14ea290d-5385-4f1b-ac5d-87d7f4ac4be8	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	DEYSI DIAZ	deysi.diaz@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	24e30457-f1fd-4921-bdb9-1e8a507cd200	\N	2026-07-31 23:49:09.154423+00	2026-07-31 23:49:09.881036+00	\N
7d6805e7-20c5-4251-9369-16f56021fb6c	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	SUBAGENCIA (E)	subagencia.edwin@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	24e30457-f1fd-4921-bdb9-1e8a507cd200	\N	2026-07-31 23:49:09.185425+00	2026-07-31 23:49:09.900804+00	\N
11a9644f-8356-4a79-9e1c-c5e615e534cd	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	REBECA BOZA	rebeca.boza@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	24e30457-f1fd-4921-bdb9-1e8a507cd200	\N	2026-07-31 23:49:09.217822+00	2026-07-31 23:49:09.920164+00	\N
f7ada3fd-fee1-42cb-90ce-b0d40a31e529	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	MARCO PEREZ	marco.perez@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	24e30457-f1fd-4921-bdb9-1e8a507cd200	\N	2026-07-31 23:49:09.256828+00	2026-07-31 23:49:09.939756+00	\N
ba350bf2-4e1d-455b-a636-4c4649e590f7	8cf0dc52-d07f-4cce-91c4-db5ca90ebe77	PABLO SAENZ	pablo.saenz@conection-futura.com	$2b$10$p4EWVj4aMv.Sn8OD5H6RmOW93vpdrecHzymLH/iycQS.ofImVQrJS	\N	ASESOR_VENTAS	\N	t	13b1e862-d061-41b1-8864-d3c2c228948f	\N	2026-07-31 23:49:09.287413+00	2026-07-31 23:49:09.959823+00	\N
\.


--
-- Data for Name: ventas_fija; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventas_fija (id, opportunity_id, ruc, razon_social, representante_legal, dni_rrll, celular_rrll, correo_electronico, nombre_padres_rrll, fecha_nacimiento_rrll, lugar_nacimiento_rrll, tipo_domicilio, direccion_fiscal, direccion_instalacion, departamento, provincia, distrito, referencia, coordenadas_gps, tipo_tecnologia, tipo_play, velocidad, cargo_fijo_sin_igv, campana, adicionales, tipo_servicio, cantidad_lineas, tipo_movil, plano_url, observaciones, notas_postventa, created_at, updated_at) FROM stdin;
d3069c02-f8b5-4e03-bb28-78a681441fd1	233e04c9-6ec9-47b8-a58d-f0c5f3974ab1	20555555551	Corporación Inka S.A.C.	Juan Perez Lopez	40404040	999888777	contacto@cliente.com	\N	\N	\N	Oficina	Av. Paseo de la República 321	Av. Paseo de la República 321, Int 502	Lima	Lima	San Isidro	\N	\N	FTTH	1Play	400 Mbps	450.00	Campaña Corporativa 2026	\N	Fija	\N	\N	\N	Cliente corporativo de televentas	\N	2026-07-31 23:49:10.473421+00	2026-07-31 23:49:10.473421+00
0fb2a535-b328-45a1-8285-f8c2c1dd55b6	823b9669-c764-4c66-b6bd-0ce8ea460c30	20555555552	Logística Transandina	Juan Perez Lopez	40404040	999888777	contacto@cliente.com	\N	\N	\N	Oficina	Av. Paseo de la República 321	Av. Paseo de la República 321, Int 502	Lima	Lima	San Isidro	\N	\N	FTTH	1Play	400 Mbps	720.00	Campaña Corporativa 2026	\N	Fija	\N	\N	\N	Cliente corporativo de televentas	\N	2026-07-31 23:49:10.491273+00	2026-07-31 23:49:10.491273+00
f1271602-3e18-4046-805c-b49e18333465	f86282d8-2eca-439f-9731-3b63c5d0ef44	20555555553	Servicios Médicos del Perú	Juan Perez Lopez	40404040	999888777	contacto@cliente.com	\N	\N	\N	Oficina	Av. Paseo de la República 321	Av. Paseo de la República 321, Int 502	Lima	Lima	San Isidro	\N	\N	FTTH	1Play	400 Mbps	310.00	Campaña Corporativa 2026	\N	Fija	\N	\N	\N	Cliente corporativo de televentas	\N	2026-07-31 23:49:10.505149+00	2026-07-31 23:49:10.505149+00
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

\unrestrict b6mcbhdchYyv6eJT9zQAmrQPPF0Y8fgDNjA8BbbKOntMMhGwJSpYiBQD4qw4QSa

