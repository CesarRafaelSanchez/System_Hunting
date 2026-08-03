# Flujo de Trabajo y Despliegue en Producción (Prompt para el Agente)

Este documento define el proceso estándar que el Agente de IA debe seguir para el desarrollo de nuevas características (`features`) o correcciones de errores (`fixes`), y su posterior despliegue en el servidor de producción (`svrmain`).

Por favor, sigue estas instrucciones paso a paso para evitar errores u omisiones en el flujo:

## 1. Desarrollo y Pruebas Locales
1. Asegúrate de partir desde la rama `develop` actualizada.
2. Crea una nueva rama siguiendo la convención de nombres: `feature/nombre-funcionalidad` o `fix/nombre-correccion`.
3. Escribe el código necesario para cumplir con los requerimientos del usuario.
4. Para probar los cambios en el entorno local, utiliza siempre el comando:
   ```bash
   docker compose up -d --build
   ```
5. Confirma con el usuario que los cambios reflejados en el entorno local sean los correctos.

## 2. Fusión (Merge) a Develop
Una vez que el usuario apruebe los cambios en el entorno local:
1. Realiza el commit de tus cambios en la rama de trabajo.
2. Cambia a la rama `develop`:
   ```bash
   git checkout develop
   ```
3. Fusiona la rama de trabajo hacia `develop`:
   ```bash
   git merge <nombre-de-la-rama>
   ```
4. Sube los cambios al repositorio remoto:
   ```bash
   git push origin develop
   ```
5. Solicita autorización al usuario para pasar los cambios a producción.

## 3. Fusión (Merge) a Main (Producción)
Una vez que el usuario autorice el pase a producción:
1. Cambia a la rama `main`:
   ```bash
   git checkout main
   ```
2. Fusiona los cambios aprobados desde `develop`:
   ```bash
   git merge develop
   ```
3. Sube los cambios al repositorio remoto:
   ```bash
   git push origin main
   ```

## 4. Despliegue en el Servidor de Producción (`svrmain`) mediante MCP
Los cambios en GitHub no se reflejan automáticamente en el servidor hasta ejecutar la actualización interna. Utiliza el servidor MCP `svrmain` configurado en el sistema del usuario (que contiene los parámetros de IP, usuario y contraseña de SSH).

Sigue estos pasos precisos con la herramienta MCP:
1. Utiliza la herramienta `ssh_connect` seleccionando el servidor `svrmain` configurado para obtener un `connectionId`.
   * *Nota: Las credenciales necesarias (como la contraseña y el host) ya están incluidas en la configuración MCP del usuario, o pueden ser inyectadas en la llamada.*
2. Utiliza la herramienta `ssh_exec` con el `connectionId` obtenido, e incrementa el parámetro de tiempo de espera (`timeout: 300000` o 5 minutos) ya que el proceso de *build* en Docker puede demorar.
3. Ejecuta el siguiente comando en el servidor remoto para descargar el nuevo código y reconstruir los contenedores:
   ```bash
   cd ~/System_Hunting && git pull origin main && docker compose up -d --build
   ```
4. Verifica que los logs de salida (`stdout` y `stderr`) indiquen que el build finalizó con éxito y los contenedores estén corriendo (`exitCode: 0`).
5. Notifica al usuario que el proceso ha terminado exitosamente y que ya puede visualizar los cambios recargando el CRM en producción (https://crm.novacoresac.com).