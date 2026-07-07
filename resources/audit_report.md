# 🏢 Auditoría Técnica del Ecosistema de Hunting (Estado Actual)

**Objetivo:** Establecer la radiografía técnica exacta de la infraestructura en producción (GHL + Middleware + SVR_MAIN) del proceso de Hunting, sin incluir proyecciones futuras, para entender la complejidad operativa y las deudas técnicas actuales.

---

## 1. Arquitectura de Datos (GHL)

GoHighLevel (GHL) actúa como la base de datos principal, el CRM visual para los ejecutivos y el motor de captura de datos inicial. La información se orquesta de la siguiente manera:

### A. Organización de Entidades
*   El modelo de datos gira en torno a **Oportunidades** atadas a **Contactos** y **Compañías (Businesses)**.
*   Cada "Edificio" o "Condominio" se crea bajo la entidad `Company` (Compañía).
*   El "Administrador" o presidente de la junta del edificio se guarda como la entidad `Contact`.

### B. Pipelines y Etapas (19 Stages)
El flujo de vida de una oportunidad fluye a través del Pipeline Principal (`Hunting - Habilitación`), el cual cuenta exactamente con **19 etapas**. Este pipeline refleja el ciclo completo desde el descubrimiento hasta la construcción:
1.  **Edificio Prospectado**
2.  **Prospecto Aceptado**
3.  **Pendiente Envió de Formulario de Asignación**
4.  **Formulario de Asignación/Reasignación Completado** *(Gatilla Webhook 1)*
5.  **Validación Back Office**
6.  **Solicitud de Asignación/Reasignacion Enviada a WIN**
7.  **Esperando Respuesta WIN** *(Auto-avanzado por Middleware)*
8.  **Asignación Aprobada**
9.  **Asignación Rechazada**
10. **Pendiente Reasignación**
11. **Pendiente Envío de Formulario Ficha de Datos**
12. **Formulario de Ficha de Datos Completado** *(Gatilla Webhook 2)*
13. **Validación Back Office 2**
14. **Ficha de Datos Enviada a WIN**
15. **Pendiente Inicio de Habilitación (construccion)**
16. **En Habilitación Técnica**
17. **Standby por Accesos**
18. **Habilitación Completa**
19. **Hunting Perdido/ No Recuperable**

### C. Formularios Core
Actualmente dependemos de 2 formularios fundamentales alojados en GHL:
*   **Formulario de Asignación (Génesis):** Captura datos básicos (`Nombre del Proyecto`, `Distrito`, `Tipo de Ingreso`, `Ejecutivo`). Sirve para apartar o "pisar" el proyecto en GHL para un ejecutivo. (Etapa 4).
*   **Ficha de Datos:** Formulario técnico, extenso, que recauda fechas de entrega, número de hogares por piso y torre, datos del responsable (Junta directiva o Admisnitrador) y fotografías estructurales (montantes, fachada). (Etapa 12).

### D. Campos Personalizados (Custom Fields)
Para soportar la Ficha de Datos, existen más de 40 campos personalizados agrupados lógicamente en:
*   **Identificación y Clasificación:** `cf_nombre_proyecto`, `cf_tipo_proyecto`, `cf_clasificacion_proyecto`.
*   **Construcción y Fechas:** `cf_tipo_construccion_edificio`, fechas de entrega y término de montantes.
*   **Responsable del Predio:** Cargo, nombre, teléfono, correo.
*   **Ubicación:** Departamento, provincia, distrito, tipo de vía, nombre de vía, numeración y coordenadas.
*   **Estructura Técnica (Torres):** Total de torres, hogares. Multiplicado por 3 torres (Pisos, hogares por piso).
*   **Archivos (Media):** `cf_foto_edificio`, `cf_foto_montantes`.
*   **Workarounds:** `cf_gestor_real` y `cf_ejecutivo_principal` para forzar la asignación esquivando limitaciones de GHL.

---

## 2. Roles e Interacción con el Pipeline

El éxito del Pipeline recae fuertemente en la interacción humana combinada con la automatización. Existen dos roles críticos:

### A. El Rol del Hunter (Ejecutivo de Campo)
El Hunter es quien empuja físicamente los datos al sistema desde la calle. Su interacción es móvil y depende fuertemente de integraciones rápidas:
*   **Interacción con el Bot (WhatsApp):** Antes o durante su visita, el Hunter interactúa con el `bot_whatsapp_hunting_futura`. Usando WhatsApp, puede consultar ágilmente si un edificio ya está asignado o sus datos básicos sin tener que abrir la pesada app de GHL en su celular, ya que el Bot se conecta al SQLite del Middleware (ultrarrápido).
*   **Formulario 1:** El Hunter llena este formulario para asegurar su autoría sobre el edificio prospectado, llevándolo a la Etapa 4.
*   **Formulario 2 (Ficha de Datos):** Una vez que avanza el negocio, el Hunter recopila la información técnica minuciosa del administrador y toma fotos de las montantes, subiéndolo todo vía el formulario 2.

### B. El Rol del Back Office (BO)
El Back Office actúa como el "Control de Calidad" (QA) y auditor del sistema, asegurando que los datos inyectados por los Hunters sean consistentes.
*   **Validación Back Office (Etapa 5):** Revisa que el Formulario de Asignación esté correcto. Identifica y subsana problemas originados por el sistema (como ejecutivos que no fueron asignados correctamente y cayeron en la cubeta de "Fallback").
*   **Validación Back Office 2 (Etapa 13):** Es un filtro técnico estricto. El BO revisa que las fotos (descargadas por el middleware) sean legibles, que las sumas de hogares y pisos tengan sentido matemático y valida coordenadas (ej. en el Google Sheet de Novacore).
*   **Gestión de Orfandad (Fantasmas):** El BO frecuentemente tiene que lidiar de forma manual (o disparar scripts) para corregir los "Contactos Fantasmas" que GHL genera erróneamente cuando no hay emails/teléfonos en la etapa inicial.

---

## 3. Capa de Lógica e Hilo Conductor de Automatizaciones (Middleware `ghl_system`)

El middleware automatiza las operaciones de backend para sortear las limitaciones nativas de GHL y conectar los servicios externos. A continuación se detallan las automatizaciones exactas ejecutadas en cada punto de control del flujo:

### A. Automatización 1: El Génesis (Webhook Formulario 1)
Cuando se completa el formulario de Asignación, el middleware realiza los siguientes pasos automatizados:
1.  **Prevención de Duplicados:** Ejecuta una búsqueda por texto en la API de GHL para verificar si el proyecto ya existe en el pipeline (`PIPELINE_ID`). Si existe, ignora el webhook previniendo duplicación visual.
2.  **Enrutamiento Dinámico de Propietarios:**
    *   Si el tipo de ingreso es **Referido**: Fuerza la asignación de la oportunidad a `Stefano Sotomarino Goche`.
    *   Si el ejecutivo principal es una cuenta temporal tipo "BO (Para revisión...)":
        *   Si es **Novacore**: Asigna a `Alexander Watson Huamani`.
        *   Si es **Futura**: Asigna a `Stefano Sotomarino Goche`.
    *   Si es un Hunter normal: Busca coincidencia tolerante de strings contra `usuarios.json` para resolver el ID interno de usuario de GHL.
3.  **Orquestación de Entidades en GHL:** 
    *   Crea o actualiza el Contacto inyectando tags correspondientes (`NUEVO HUNTING`, `Origen: X`, `Distrito: Y`).
    *   Crea una Compañía (Business) con el nombre del predio.
    *   Asocia la Compañía al Contacto creado.
    *   Crea la Oportunidad en la etapa `Formulario de Asignación/Reasignación Completado` y le asigna un seguidor automático (Stefano).
4.  **Sincronización Custom Fields:** Sincroniza y fuerza en GHL los campos `cf_gestor_real` y `cf_ejecutivo_principal` con el nombre limpio del ejecutivo resuelto.
5.  **Caché en SQLite:** Guarda una copia estructurada de la oportunidad inicial en la tabla `oportunidades_ficha`.

### B. Automatización 2: El Levantamiento Técnico (Webhook Formulario 2)
Al llenarse la Ficha de Datos, el middleware ejecuta:
1.  **Descarga Proactiva de Archivos Multimedia:** Extrae las URLs temporales de GHL para `cf_foto_edificio` y `cf_foto_montantes`. Agrega los parámetros de autenticación del API de GHL (`alt=media&locationId=...`) y descarga las imágenes en el disco local del servidor convirtiéndolas a formato JPEG compatible.
2.  **Detección y Limpieza de "Contactos Fantasmas":** Detecta si el ID del contacto que envió el formulario es distinto al ID del contacto original de la oportunidad. Si difieren, extrae la data técnica del nuevo contacto, la asocia al contacto original de la oportunidad y **elimina automáticamente el contacto fantasma creado por GHL** vía API REST.
3.  **Actualización Normalizada de Compañía:** Crea o actualiza la Compañía en GHL completando los datos de dirección unificada, teléfono, email, distrito, departamento y código postal.
4.  **Generación de Enlaces de Edición Seguros:** Genera dinámicamente un token HMAC con hashing SHA-256 usando el ID de la oportunidad y la secret key del servidor para crear una URL de edición única (`/ficha/editar/<id>?token=<hash>`) y la guarda dentro del Custom Field `cf_enlace_edicion_ficha` en GHL.
5.  **Actualización SQLite:** Sobrescribe la caché local con la data técnica completa y las rutas de las imágenes locales.

### C. Automatización 3: Auto-Avance & Distribución (Webhook de Correo / Avance)
Este proceso actúa como despachador inteligente según la división del negocio:
*   **Si es Novacore (Inyección a Hojas de Cálculo):**
    1.  Lee todo el Google Sheet actual para encontrar la primera fila vacía basada en columnas clave (`FECHA REGISTRO`, `NOMBRE DEL PREDIO`, etc.).
    2.  **Limpieza del Ejecutivo:** Si el tipo de ingreso es **Referido**, deja vacía la celda del Ejecutivo en la hoja. De lo contrario, inyecta el ejecutivo principal resuelto.
    3.  **Procesamiento de Coordenadas:** Separa automáticamente la cadena de coordenadas del campo `cf_coordenadas` (ej. "-12.12,-77.00") en dos columnas dedicadas: `LATITUD` y `LONGITUD`.
    4.  Escribe toda la fila estructurada en el Google Sheet a través de la Google Sheets API.
*   **Si es Futura (Notificación WIN):**
    1.  Envía un correo de asignación de manera automatizada utilizando SMTP autenticado a WIN.
*   **Avance de Etapa:** Si cualquiera de las dos operaciones anteriores es exitosa, llama al API de GHL y **mueve automáticamente la tarjeta** a la etapa `Esperando Respuesta WIN`.

### D. Automatización 4: Exportación Final a WIN (Webhook Ficha de Datos WIN)
Se encarga de armar el entregable técnico final:
1.  **Recuperación Híbrida de Datos:** Recupera la ficha técnica unificando los datos del webhook con la base SQLite local para no perder información si algún campo no viene en el payload inmediato de GHL.
2.  **Mapeo Dinámico y Cálculo de Estructura (Torres):**
    *   Carga la plantilla de Excel (`.xlsx`) oficial usando `openpyxl`.
    *   Mapea los campos técnicos a las celdas exactas formateándolos en mayúsculas.
    *   Lee la cantidad de pisos de las torres (hasta 3 torres) y parsea el string de hogares por piso (ej. "4,4,4,4" o "8" para todos los pisos). Dibuja dinámicamente las celdas del bloque del edificio y agrega la fórmula `=SUM(...)` para computar los hogares totales.
3.  **Inyección Física de Imágenes:** Inserta las imágenes descargadas previamente del predio y las montantes en las posiciones correspondientes del Excel, ajustando el ancho y alto en píxeles.
4.  **Despacho por Email:** Guarda el Excel final en el servidor y lo envía por correo electrónico a WIN de forma automática con copia a los coordinadores de cuenta.

---

## 4. Flujos de Trabajo (Integraciones del Proceso)

*   **Google Sheets (`sheets_service.py`):** Inyecta oportunidades dinámicamente con Google Service Accounts.
*   **Servicios SMTP Externos (`email_smtp.py`):** Despacho de excels formateados a WIN.
*   **Ecosistema WhatsApp (OpenWA):** El bot `bot_whatsapp_hunting_futura` consume `/api/cache/` del Middleware. Vital para las consultas móviles de los Hunters.

---

## 5. Mapa de Dependencias y Limitaciones

*   **Fragilidad de `svr_main` and Tunnels:** Si el túnel de Cloudflare o el servidor fallan, los formularios entran a GHL pero **nunca se procesan ni asignan**.
*   **Cuello de Botella Síncrono:** El middleware descarga imágenes de la ficha técnica *mientras* el webhook de GHL espera. Si la descarga tarda, el webhook da "Timeout", causando reintentos y duplicación de procesos en el servidor.
*   **Inconsistencia de Datos ("Contactos Fantasma"):** GHL exige `email` o `teléfono` para unificar. Los predios nuevos no los tienen, forzando a GHL a crear duplicados basuras que el middleware debe borrar activamente.
*   **Desincronización de Caché (SQLite vs GHL):** Si BO o un Líder mueve una tarjeta manualmente saltando las validaciones automatizadas, el Bot de WhatsApp mostrará datos incorrectos al Hunter, causando roces en la operación.
*   **Acoplamiento (Hardcoding):** Reglas operativas (lista de Hunters Novacore, nombres de BO) están quemadas en el código Python. Cada nuevo Hunter requiere un despliegue de desarrollo.

---

## 6. Consideraciones Clave para un Planteamiento de CRM Propio (In-House)

Para solventar las limitaciones técnicas actuales en un futuro desarrollo propio, la arquitectura del nuevo sistema debería estructurarse bajo los siguientes principios directos:

### A. Modelo de Datos Unificado (Single Source of Truth)
*   **Entidad Central "Predio":** En lugar de forzar el modelo genérico de GHL (Contacto + Compañía + Oportunidad), el nuevo CRM debe tener una tabla relacional principal `Predio` (o `Edificio`).
*   **Integridad por Diseño (Adiós Fantasmas):** Las tablas de `Oportunidades`, `Contactos` (Administradores) y `Archivos` (Fotos) deben estar vinculadas mediante llaves foráneas (`Foreign Keys`) a la tabla `Predio`. Esto garantiza que los formularios sucesivos actualicen registros existentes de manera inequívoca y elimina de raíz la creación de contactos duplicados huérfanos.

### B. Arquitectura Asíncrona (Task Queues)
*   **Procesamiento en Background:** Para eliminar el cuello de botella de los webhooks lentos (descargas de fotos, generación de archivos openpyxl de Excel y despacho SMTP), el CRM propio debe utilizar una cola de tareas asíncronas (ej. **Celery con Redis** o **BullMQ**). El servidor web recibe el formulario, responde instantáneamente con un status HTTP 202 (Aceptado) y delega el trabajo pesado a procesos workers en segundo plano.

### C. Sistema de Formularios Dinámicos e Inmutables
*   **Validaciones en Caliente:** Al desarrollar un frontend de captura propio (en React/Next.js o Vue), las validaciones (formato de coordenadas, obligatoriedad de campos, asignación de Hunters activos desde la base de datos) se ejecutan en el cliente y en la API del servidor antes de guardar. Esto elimina la necesidad de sanitizar cadenas defectuosas o parsear coordenadas manualmente en el backend.
*   **Configuración Dinámica del Staff:** La lista de ejecutivos (Novacore, Futura, Referidos) debe gestionarse desde un panel administrativo (`Usuarios` y `Roles` en la base de datos relacional) y no estar quemada en archivos de configuración o scripts de backend, facilitando la escalabilidad del equipo sin requerir despliegues de código.

### D. Desacoplamiento de Integraciones y API First
*   **API Segura y Autenticada:** El nuevo CRM debe exponer un backend API REST robusto protegido mediante tokens (JWT o API Keys) para que sistemas externos (como el Bot de WhatsApp o el Google Sheets) interactúen directamente con el estado en tiempo real, eliminando la duplicación en SQLite y el desfase de caché del Bot de WhatsApp.
