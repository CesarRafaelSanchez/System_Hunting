# 🗺️ Matriz del Ciclo de Vida de la Oportunidad (20 Etapas)

## Flujo de Etapas

| Etapa de Origen | Acción / Disparador | Etapa de Destino | Tipo de Evento | Guardián / Regla Estricta |
| :--- | :--- | :--- | :--- | :--- |
| **1. Edificio Prospectado** | BO revisa Formulario 1 | 2. Aceptado o 3. Rechazado | Manual (BO) | Basado en Resultado y Detalle de Visita. |
| **2. Prospecto Aceptado** | Tiempo de espera (Delay) | 4. Pendiente Asignación | Automático | El sistema lo mueve solo; no requiere arrastre. |
| **4. Pendiente Asignación** | Hunter envía Formulario 2 | 5. Asignación Completado | Automático | Gatillado por envío exitoso del Hunter de ese predio. |
| **5. Asignación Completado** | Tiempo de espera (Delay) | 6. Validación BO | Automático | El sistema lo mueve solo; prepara la revisión. |
| **6. Validación BO** | BO edita y presiona "Revisado" | 7. Solicitud Enviada a WIN | Manual (BO) | Bloqueado si no presionó el botón en el Split-View. |
| **7. Solicitud Enviada WIN** | Éxito en Worker (SMTP/Sheets) | 8. Esperando Respuesta WIN | Automático | El sistema valida el envío y mueve la tarjeta. |
| **8. Esperando Respuesta** | BO recibe correo de WIN | 9. Aprobada o 10. Rechazada | Manual (BO) | El BO decide según la respuesta del partner WIN. |
| **10. Asignación Rechazada** | BO gestiona reasignación | 11. Pendiente Reasignación | Manual (BO) | Para histórico de marcas de exclusividad temporal. |
| **9. Asignación Aprobada** | Tiempo de espera (Delay) | 12. Pendiente Ficha Datos | Automático | Abre el paso para la inspección de campo. |
| **12. Pendiente Ficha** | Hunter envía Formulario 3 | 13. Ficha Completado | Automático | Gatillado al recibir la data técnica pesada. |
| **13. Ficha Completado** | Transición inmediata | 14. Validación BO 2 | Automático | El sistema lo mueve de forma instantánea. |
| **14. Validación BO 2** | BO edita y presiona "Revisado" | 15. Ficha Enviada a WIN | Manual (BO) | Bloqueado si no se validó la matriz de torres. |
| **15. Ficha Enviada WIN** | Éxito en Worker (Excel openpyxl) | 16. Pendiente Habilitación | Automático | Valida el despacho físico del reporte .xlsx. |
| **16. Pendiente Inicio** | BO lee correo de inicio de obra | 17. En Habilitación Técnica | Manual (BO) | Control de estado de construcción física. |
| **17. En Habilitación** | Problemas de permisos / accesos | 18. Standby por Accesos | Manual (BO) | Congela el flujo por bloqueos externos. |
| **17. En Habilitación** | Reporte técnico de fin de obra | 19. Habilitación Completa | Manual (BO) | Etapa Final Ganada (status: WON). |
| **Cualquiera** | Cancelación / Pérdida crítica | 20. Hunting Perdido | Manual (BO) | Etapa Final (LOST). Exige Motivo Obligatorio. |

---

## 🔒 Reglas de Restricción de Permisos Visuales

* **Hunters:** Pueden ver e ingresar a sus propios predios y métricas de desempeño. Tienen prohibido (`pointer-events-none`) arrastrar o mover tarjetas en el tablero.
* **BackOffice / Admin:** Tienen control total sobre las 20 columnas. El sistema rechazará y revertirá automáticamente cualquier arrastre que salte los pasos automáticos o intente mover a las etapas 7 o 15 sin su respectivo botón de revisión firmado.