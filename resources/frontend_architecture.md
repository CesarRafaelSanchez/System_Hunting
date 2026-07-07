# Documento de Arquitectura UI/UX y Requerimientos Funcionales (Frontend)

Este documento definitivo establece las bases estructurales, funcionales y de experiencia de usuario para la PWA del Hunting CRM. 

---

## 1. Paradigma Visual: Inspiración en GoHighLevel (GHL)

El sistema hereda el ADN visual y funcional de GHL:
- **Layout Limpio**: Whitespace, tipografía moderna, sidebar lateral para submódulos y top bar contextual.
- **Vista Kanban**: Tarjetas dinámicas con Badges de prioridad, Etiquetas de Lead Source y Nombre del Ejecutivo.
- **Panel de Control de Oportunidades (Split-View)**: Al abrir una tarjeta, se despliega una vista dividida:
  - *Izquierda*: Información General.
  - *Centro*: Historial/Timeline (Saltos de etapa, incidentes).
  - *Derecha*: Acciones y visualizador integrado de los Formularios.

---

## 2. Matriz Funcional por Roles y Validación BackOffice

### 2.1. Hunter (PWA en Calle)
- Interfaz *Mobile-First*, optimizada a una mano.
- **Formularios con Patrón Wizard/Stepper** protegidos offline con `Zustand`.

### 2.2. BackOffice (Desktop - Control y Aprobación)
- **Reflejo Editable de Formularios**: Dentro del panel Split-View de GHL, el BackOffice podrá ver el espejo idéntico de lo que ingresó el Hunter en los Formularios (Registro, Asignación y Ficha Técnica).
- **Poder de Sobreescritura**: El BackOffice tiene autoridad total para auditar y modificar cualquier campo de texto, coordenada o actualizar fotos subidas por el Hunter antes del envío oficial.
- **Gatillo de Automatización**: El despacho de datos (ej. generación del Excel de WIN o envíos a Google Sheets) quedará suspendido en las Etapas 6 y 14. Solo ocurrirá de forma automatizada cuando el BackOffice finalice la corrección y presione el botón explícito de **"Aprobar Validación"**.

---

## ANEXO DE INGENIERÍA DE DETALLE

### A1. Optimización del Tablero Kanban (20 Etapas)
- **Virtualización de DOM (Windowing)** para congelar columnas fuera de pantalla.
- **CSS GPU Acceleration** en `dnd-kit` (translate3d) para un Drag & Drop a 60FPS.

### A2. Arquitectura de Ingesta (Formularios Core)
Clones visuales exactos de las plantillas oficiales (WIN/Novacore):
1. **Formulario 1 (Registro de Predio)**: Rápido; "pisa" el prospecto.
2. **Formulario 2 (Asignación)**: Mapeo de la grilla Novacore (Dirección, Zona, Coordenadas, Estado).
3. **Formulario 3 (Ficha de Datos)**: Espejo técnico del Excel de WIN (Bloque Proyecto, Tiempos, Responsable, Inspección, Ubicación y Matriz Estructural Dinámica).

### A3. Compresión Multimedia Nativa y Eficiencia (Hunter)
Para garantizar la resiliencia en zonas de baja conectividad y no agotar el caché de LocalStorage/IndexedDB:
- **Límite de Carga Operativa**: Solo se subirán 2 fotos obligatorias (`foto_fachada` y `foto_montantes`).
- **Origen de Imagen**: Ingesta nativa desde la galería del dispositivo (selector de archivos).
- **Compresión HTML5 Canvas**: Antes de que la imagen sea persistida en estado o enviada a la API, el navegador ejecutará una compresión nativa utilizando la API Canvas. Las imágenes serán escaladas y recortadas a una resolución máxima de **1600x1600 px** en formato JPEG/WebP con **calidad al 80%**, asegurando que los envíos pesen meros kilobytes y no megabytes.

---
