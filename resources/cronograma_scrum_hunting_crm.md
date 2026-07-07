# 🗓️ Cronograma Ágil de Desarrollo — Hunting CRM
### Sprint Plan · Julio 2026 · 4 Semanas

---

> **Objetivo del Mes:**
> Llevar el sistema Hunting CRM de su estado funcional actual (motor de pipeline operativo en contenedores Docker) a un producto **listo para producción**, con todos los flujos de usuario completos, formularios activos, integraciones de terceros verificadas y un entorno de staging estable entregado al equipo operativo.

---

## 📋 Estado de Partida (Baseline al 03-Jul-2026)

El sistema ya cuenta con:
- ✅ Infraestructura Docker multi-contenedor (Postgres, Redis, NestJS, Vite/Nginx, Nginx Proxy)
- ✅ Motor de pipeline de 20 etapas con transiciones automáticas y manuales
- ✅ Control de acceso por roles (HUNTER / BACKOFFICE / ADMIN)
- ✅ Kanban Board premium con Split-View y Drag & Drop (restringido por rol)
- ✅ Sistema de asistencia (TimeMark) y autenticación JWT
- ✅ Cola asíncrona BullMQ + workers Python (openpyxl)

---

## 🏃 Sprint 1 — Semana 1 & 2 (07 – 18 Jul 2026)
### Tema: **Core de Formularios & Flujo de Datos End-to-End**

> **Objetivo:** Activar los 3 formularios operativos del pipeline y conectarlos con el backend de forma que el Hunter pueda completar su ciclo de trabajo de forma autónoma desde el día 1.

---

### 📅 Semana 1 · 07 – 11 Jul

| #  | Tarea | Responsable | Esfuerzo |
|----|-------|-------------|----------|
| 1.1 | **Formulario 1 – Registro de Predio:** Construir la vista del Hunter con todos los campos reales (`forms_specification.md`): dropdown de Hunters, 43 distritos de Lima, resultado de visita, textarea de detalle. | Frontend | 2 días |
| 1.2 | **API Endpoint `POST /predios`:** Persistir el Predio + disparar creación de la Oportunidad en Etapa 1 automáticamente. Incluir validación de payload. | Backend | 1.5 días |
| 1.3 | **Formulario 2 – WIN Asignación:** Construir el formulario completo con selects de tipo de ingreso, tipo de edificio, tipo de vía, coordenadas y campo de Asignar/Reasignar. Pre-poblar datos del predio ya registrado. | Frontend | 2 días |
| 1.4 | **Endpoint `PATCH /opportunities/:id/stage` para transición 4→5:** Al enviar Form2 exitosamente, el sistema mueve la oportunidad a "Formulario de Asignación Completado" de forma automática. | Backend | 0.5 días |

---

### 📅 Semana 2 · 14 – 18 Jul

| #  | Tarea | Responsable | Esfuerzo |
|----|-------|-------------|----------|
| 2.1 | **Formulario 3 – Ficha de Datos (Levantamiento Técnico):** Construir el formulario de 28 campos reales según spec: torres, hogares, junta directiva, coordenadas, foto del edificio, foto de montantes. Incluir Drag & Drop de archivos. | Frontend | 3 días |
| 2.2 | **Módulo de Media Upload:** Endpoint `POST /media/upload` para recibir los archivos adjuntos del Form3 y almacenarlos en volumen Docker o S3. | Backend | 1 día |
| 2.3 | **Endpoint Form3 → Transición 12→13→14:** Al recibir la Ficha completa, el sistema dispara las transiciones automáticas instantáneas. | Backend | 0.5 días |
| 2.4 | **Vista del Hunter – "Mis Predios" (Historial):** Lista filtrable de predios propios con estado del pipeline, fechas y acceso al Split-View de solo lectura. | Frontend | 1.5 días |

---

### 🏁 Milestone Sprint 1
> **Entregable:** El Hunter puede realizar su ciclo operativo completo de forma autónoma: registrar un predio en campo, completar el formulario de asignación WIN y subir la ficha técnica. El Kanban de BackOffice refleja cada movimiento en tiempo real.

---

## 🏃 Sprint 2 — Semana 3 & 4 (21 Jul – 01 Ago 2026)
### Tema: **Integraciones de Terceros, Admin Dashboard & Hardening de Producción**

> **Objetivo:** Activar las integraciones reales de Google Sheets y SMTP, construir el panel de administración para gestión de usuarios y KPIs, y dejar el sistema preparado para el despliegue productivo.

---

### 📅 Semana 3 · 21 – 25 Jul

| #  | Tarea | Responsable | Esfuerzo |
|----|-------|-------------|----------|
| 3.1 | **Integración Google Sheets (Worker Real):** Activar el `service_account.json` en `credentials/`. Conectar el Worker BullMQ para escribir la Ficha Técnica en el spreadsheet de WIN al llegar a la Etapa 15. | Backend / Infra | 2 días |
| 3.2 | **Integración SMTP Real (Envío a WIN):** Conectar el Worker de notificación de Etapa 7 con el servidor SMTP configurado en `.env`. Verificar que el correo de solicitud de asignación llega al destinatario. | Backend | 1 día |
| 3.3 | **Panel de Admin – Gestión de Usuarios:** Vista CRUD para crear, editar y deshabilitar Hunters y Backoffice. Asignación de canales (`FUTURA` / `NOVACORE`). | Frontend + Backend | 2 días |
| 3.4 | **Dashboard de KPIs (Admin):** Gráficos de embudo de pipeline: oportunidades por etapa, tasa de conversión, top Hunters por volumen. Libería Chart.js o Recharts. | Frontend | 1 día |

---

### 📅 Semana 4 · 28 Jul – 01 Ago

| #  | Tarea | Responsable | Esfuerzo |
|----|-------|-------------|----------|
| 4.1 | **PWA & Mobile:** Activar Service Worker en Vite para instalación en dispositivos móviles del Hunter en campo. Validar Form1 en vista móvil. | Frontend | 1 día |
| 4.2 | **Hardening de Seguridad:** Rate limiting, CORS en producción, validación de JWT en todas las rutas protegidas, sanitización de inputs en DTOs. | Backend | 1 día |
| 4.3 | **QA Integral de Flujo:** Recorrer las 20 etapas del pipeline con un escenario de usuario real (Hunter + BO + Admin). Documentar bugs y resolverlos. | Full Stack | 1.5 días |
| 4.4 | **Configuración de Staging/Producción:** Preparar el `docker-compose.prod.yml` con variables de entorno seguras, volúmenes persistentes con backup, y configuración HTTPS (Certbot/Let's Encrypt). | DevOps | 1 día |
| 4.5 | **Demo & Feedback CEO:** Sesión de presentación del sistema operativo. Recolección de feedback y priorización del backlog post-lanzamiento. | Todos | 0.5 días |

---

### 🏁 Milestone Sprint 2
> **Entregable:** Sistema Hunting CRM en estado **Production-Ready**. Integraciones de Google Sheets y SMTP verificadas end-to-end. Panel Admin operativo. Entorno de staging con HTTPS listo para onboarding del equipo de operaciones.

---

## 📊 Resumen Visual del Plan

```
Julio 2026
Sem 1 (07-11)  ████████  Form1 + Form2 + APIs
Sem 2 (14-18)  ████████  Form3 + Media Upload + Historial Hunter
Sem 3 (21-25)  ████████  Google Sheets + SMTP + Admin Panel + KPIs
Sem 4 (28-01)  ████████  PWA + Security + QA + Staging + Demo CEO
```

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| Credenciales `service_account.json` de Google Sheets no disponibles a tiempo | Media | Usar mock del worker la primera semana; activar en Semana 3 con credenciales reales. |
| Configuración SMTP bloqueada por el proveedor de correo | Media | Tener proveedor alternativo (SendGrid/Resend) listo como fallback en `.env`. |
| Volumen de campos en Form3 genera problemas de UX en móvil | Alta | Dividir Form3 en secciones paginadas (wizard de 3 pasos) para facilitar uso en campo. |
| Atraso en QA por bugs en transiciones automáticas | Media | Mantener suite de pruebas en `docker compose exec backend` con seeds de datos reales. |

---

## 🔑 Definición de "Hecho" (Definition of Done)

Una tarea se considera **DONE** cuando:
1. ✅ El código compila sin errores TypeScript (`npm run build` limpio).
2. ✅ El endpoint o componente responde correctamente en el entorno Docker local.
3. ✅ El flujo fue verificado manualmente con datos reales de al menos un rol.
4. ✅ No existen `console.error` sin capturar en los logs del contenedor.

---

*Documento generado: 03 de Julio de 2026 | Sistema: Hunting CRM v1.0 | Clasificación: Interno — Confidencial*
