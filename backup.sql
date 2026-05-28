--
-- PostgreSQL database dump
--

\restrict M7rYWus62M2uMupJeuXa4yWt3WrLrSZT9H60B6gW6kgaB2IkzEfICZie4y8ErMM

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

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

ALTER TABLE IF EXISTS ONLY public.vehicles DROP CONSTRAINT IF EXISTS vehicles_route_id_routes_id_fk;
ALTER TABLE IF EXISTS ONLY public.stops DROP CONSTRAINT IF EXISTS stops_route_id_routes_id_fk;
ALTER TABLE IF EXISTS ONLY public.shifts DROP CONSTRAINT IF EXISTS shifts_vehicle_id_vehicles_id_fk;
ALTER TABLE IF EXISTS ONLY public.positions DROP CONSTRAINT IF EXISTS positions_vehicle_id_vehicles_id_fk;
ALTER TABLE IF EXISTS ONLY public.vehicles DROP CONSTRAINT IF EXISTS vehicles_pkey;
ALTER TABLE IF EXISTS ONLY public.stops DROP CONSTRAINT IF EXISTS stops_pkey;
ALTER TABLE IF EXISTS ONLY public.shifts DROP CONSTRAINT IF EXISTS shifts_pkey;
ALTER TABLE IF EXISTS ONLY public.routes DROP CONSTRAINT IF EXISTS routes_pkey;
ALTER TABLE IF EXISTS ONLY public.positions DROP CONSTRAINT IF EXISTS positions_vehicle_unique;
ALTER TABLE IF EXISTS ONLY public.positions DROP CONSTRAINT IF EXISTS positions_pkey;
ALTER TABLE IF EXISTS public.vehicles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stops ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shifts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.routes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.positions ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.vehicles_id_seq;
DROP TABLE IF EXISTS public.vehicles;
DROP SEQUENCE IF EXISTS public.stops_id_seq;
DROP TABLE IF EXISTS public.stops;
DROP SEQUENCE IF EXISTS public.shifts_id_seq;
DROP TABLE IF EXISTS public.shifts;
DROP SEQUENCE IF EXISTS public.routes_id_seq;
DROP TABLE IF EXISTS public.routes;
DROP SEQUENCE IF EXISTS public.positions_id_seq;
DROP TABLE IF EXISTS public.positions;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    vehicle_id integer NOT NULL,
    lat real NOT NULL,
    lng real NOT NULL,
    speed real,
    heading real,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- Name: routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routes (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: routes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.routes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: routes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.routes_id_seq OWNED BY public.routes.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shifts (
    id integer NOT NULL,
    vehicle_id integer NOT NULL,
    started_at timestamp without time zone DEFAULT now() NOT NULL,
    ended_at timestamp without time zone,
    positions_count integer DEFAULT 0 NOT NULL,
    avg_speed real,
    max_speed real
);


--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: stops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stops (
    id integer NOT NULL,
    route_id integer NOT NULL,
    name text NOT NULL,
    lat real NOT NULL,
    lng real NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: stops_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stops_id_seq OWNED BY public.stops.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    route_id integer NOT NULL,
    driver_name text NOT NULL,
    plate_number text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    pin text DEFAULT '0000'::text NOT NULL
);


--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- Name: routes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes ALTER COLUMN id SET DEFAULT nextval('public.routes_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: stops id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stops ALTER COLUMN id SET DEFAULT nextval('public.stops_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.positions (id, vehicle_id, lat, lng, speed, heading, recorded_at) FROM stdin;
5095	2	19.86105	-99.080635	-1	-1	2026-05-26 03:50:34.632
5091	1	19.86105	-99.080635	-1	-1	2026-05-27 00:31:09.175
5100	3	19.86105	-99.080635	-1	-1	2026-05-27 01:02:58.479
5108	6	19.861055	-99.08064	-1	-1	2026-05-27 01:09:13.111
\.


--
-- Data for Name: routes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.routes (id, name, description, color, active, created_at) FROM stdin;
4	Jilotzingo - Zumpango	\N	#10B981	t	2026-05-26 04:23:33.933201
1	Ruta San Juan Zitlaltepec - Metro La Raza	Sale de San Juan Zitlaltepec por Av. 16 de Septiembre, Zumpango por Melchor Ocampo y Jorge Jiménez Cantú, conecta con Circuito Mexiquense Bicentenario, Carretera México-Pachuca, Metro Indios Verdes y Metro La Raza	#e4e70d	t	2026-05-25 22:59:46.35037
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shifts (id, vehicle_id, started_at, ended_at, positions_count, avg_speed, max_speed) FROM stdin;
15	2	2026-05-19 12:11:00	2026-05-19 14:51:51.256	0	\N	\N
16	2	2026-05-19 20:12:00	2026-05-19 22:33:47.024	0	\N	\N
17	3	2026-05-19 12:18:00	2026-05-19 14:44:29.614	0	\N	\N
18	3	2026-05-19 20:16:00	2026-05-19 22:33:15.91	0	\N	\N
19	1	2026-05-19 12:17:00	2026-05-19 14:39:33.531	0	\N	\N
20	1	2026-05-19 20:18:00	2026-05-19 22:39:42.499	0	\N	\N
21	2	2026-05-20 12:10:00	2026-05-20 14:42:38.148	0	\N	\N
22	2	2026-05-20 20:18:00	2026-05-20 22:35:37.207	0	\N	\N
23	3	2026-05-20 12:18:00	2026-05-20 14:51:18.8	0	\N	\N
24	3	2026-05-20 20:19:00	2026-05-20 22:33:09.194	0	\N	\N
25	1	2026-05-20 12:16:00	2026-05-20 14:34:01.947	0	\N	\N
26	1	2026-05-20 20:23:00	2026-05-20 22:37:10.635	0	\N	\N
27	2	2026-05-21 12:09:00	2026-05-21 14:36:57.438	0	\N	\N
28	2	2026-05-21 20:16:00	2026-05-21 22:34:30.748	0	\N	\N
29	3	2026-05-21 12:02:00	2026-05-21 14:32:43.509	0	\N	\N
30	3	2026-05-21 20:16:00	2026-05-21 22:39:08.766	0	\N	\N
31	1	2026-05-21 12:02:00	2026-05-21 14:35:31.593	0	\N	\N
32	1	2026-05-21 20:02:00	2026-05-21 22:24:08.626	0	\N	\N
33	2	2026-05-22 12:05:00	2026-05-22 14:23:57.056	0	\N	\N
34	2	2026-05-22 20:26:00	2026-05-22 22:39:15.638	0	\N	\N
35	3	2026-05-22 12:05:00	2026-05-22 14:49:08.672	0	\N	\N
36	3	2026-05-22 20:25:00	2026-05-22 22:32:07.433	0	\N	\N
37	1	2026-05-22 12:00:00	2026-05-22 14:26:31.866	0	\N	\N
38	1	2026-05-22 20:11:00	2026-05-22 22:30:17.319	0	\N	\N
39	2	2026-05-23 12:04:00	2026-05-23 14:16:00	0	\N	\N
40	3	2026-05-23 12:06:00	2026-05-23 14:18:00	0	\N	\N
41	1	2026-05-23 12:02:00	2026-05-23 14:14:00	0	\N	\N
42	2	2026-05-24 12:08:00	2026-05-24 14:20:00	0	\N	\N
43	3	2026-05-24 12:15:00	2026-05-24 14:27:00	0	\N	\N
44	1	2026-05-24 12:04:00	2026-05-24 14:16:00	0	\N	\N
45	2	2026-05-25 12:05:00	2026-05-25 14:24:45.133	0	\N	\N
46	2	2026-05-25 20:16:00	2026-05-25 22:28:00.879	0	\N	\N
47	3	2026-05-25 12:01:00	2026-05-25 14:24:55.547	0	\N	\N
48	3	2026-05-25 20:19:00	2026-05-25 22:35:50.278	0	\N	\N
49	1	2026-05-25 12:15:00	2026-05-25 14:58:23.739	0	\N	\N
50	1	2026-05-25 20:27:00	2026-05-25 22:37:58.345	0	\N	\N
51	2	2026-05-26 12:18:00	2026-05-26 14:48:00	0	\N	\N
52	3	2026-05-26 12:04:00	2026-05-26 14:34:00	0	\N	\N
53	1	2026-05-26 12:24:00	2026-05-26 14:54:00	0	\N	\N
54	1	2026-05-26 00:39:29.326116	2026-05-26 00:39:55.445	1	\N	\N
55	1	2026-05-26 03:36:03.783825	2026-05-26 03:38:16.712	2	-1	0
56	2	2026-05-26 03:49:54.471276	2026-05-26 03:50:42.712	3	-1	0
57	1	2026-05-26 18:25:34.632365	2026-05-27 00:25:44.45	1	-1	0
58	1	2026-05-26 18:31:09.125288	2026-05-27 00:31:11.037	1	-1	0
59	3	2026-05-26 18:59:03.095148	2026-05-27 00:59:36.081	2	-1	0
60	3	2026-05-26 19:01:18.256835	2026-05-27 01:03:08.25	6	-1	0
61	6	2026-05-26 19:08:12.984375	2026-05-27 01:09:23.334	4	-1	0
\.


--
-- Data for Name: stops; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stops (id, route_id, name, lat, lng, "order", created_at) FROM stdin;
3	1	Mercado Zumpango / Jorge Jiménez Cantú	19.79775	-99.10444	3	2026-05-25 22:59:46.359647
4	1	San Pedro de la Laguna	19.77921	-99.11518	4	2026-05-25 22:59:46.359647
5	1	Circuito Mexiquense Bicentenario	19.782	-99.046	5	2026-05-25 22:59:46.359647
6	1	Carr. México - Pachuca	19.544	-99.081	6	2026-05-25 22:59:46.359647
7	1	Metro Indios Verdes	19.485075	-99.12549	7	2026-05-25 22:59:46.359647
8	1	Metro 18 de Marzo	19.4789	-99.1305	8	2026-05-25 22:59:46.359647
9	1	Metro Potrero	19.4736	-99.1352	9	2026-05-25 22:59:46.359647
10	1	Metro La Raza	19.468294	-99.14018	10	2026-05-25 22:59:46.359647
19	4	Base Jilotzingo	19.867662	-99.04865	1	2026-05-26 04:27:26.644649
20	4	Parroquia Jilotzingo	19.870562	-99.05905	2	2026-05-26 04:28:00.149218
21	4	Iglesia Rincon	19.872253	-99.08557	3	2026-05-26 04:29:20.340039
22	4	Cuevas Aldama	19.868263	-99.09549	4	2026-05-26 04:31:12.807532
23	4	Cuevas canchas	19.865612	-99.09791	5	2026-05-26 04:32:43.823538
56	4	Cuevas La Mina	19.863298	-99.1006	6	2026-05-26 04:34:18.074638
57	4	Caseta Loma Larga	19.860592	-99.10678	7	2026-05-26 04:35:54.216661
58	4	Bocanegra	19.844963	-99.114365	8	2026-05-26 04:37:30.87761
59	4	Crucero Bocanegra	19.838148	-99.12067	9	2026-05-26 04:38:37.917756
60	4	Crucero San Juan Z	19.824162	-99.11611	10	2026-05-26 04:39:42.277971
2	1	Estacion Brujas	19.799297	-99.10339	2	2026-05-25 22:59:46.359647
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicles (id, route_id, driver_name, plate_number, active, created_at, pin) FROM stdin;
2	1	Jesús Hernández Reyes	MEX-5678	t	2026-05-25 22:59:46.367514	5678
3	1	Roberto Sánchez Cruz	MEX-9012	t	2026-05-25 22:59:46.367514	9012
1	1	Juan Torres	MEX-1234	t	2026-05-25 22:59:46.367514	1234
6	4	Luis Martínez	CAS-9089	t	2026-05-26 19:07:15.386007	9089
\.


--
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.positions_id_seq', 5111, true);


--
-- Name: routes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.routes_id_seq', 4, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shifts_id_seq', 61, true);


--
-- Name: stops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stops_id_seq', 63, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 6, true);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: positions positions_vehicle_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_vehicle_unique UNIQUE (vehicle_id);


--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: stops stops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stops
    ADD CONSTRAINT stops_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: positions positions_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: shifts shifts_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: stops stops_route_id_routes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stops
    ADD CONSTRAINT stops_route_id_routes_id_fk FOREIGN KEY (route_id) REFERENCES public.routes(id);


--
-- Name: vehicles vehicles_route_id_routes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_route_id_routes_id_fk FOREIGN KEY (route_id) REFERENCES public.routes(id);


--
-- PostgreSQL database dump complete
--

\unrestrict M7rYWus62M2uMupJeuXa4yWt3WrLrSZT9H60B6gW6kgaB2IkzEfICZie4y8ErMM

