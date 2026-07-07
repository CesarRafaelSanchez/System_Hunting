**1\. Formulario 1: Registro de Predio (El Génesis)**

Propósito: Captura inicial en calle realizada por el Hunter para prospección inmediata.

| Nombre del CAMPO | Tipo de Campo | Descripción | Opciones Disponibles (si aplica) |
| :---- | :---- | :---- | :---- |
| **EJECUTIVO \*** | Dropdown / Select | Hunter líder asignado a la prospección del edificio | Lista de Hunters Activos |
| **NOMBRE DEL EDIFICIO \*** | Input Text | Nombre comercial o identificador asignado al predio | N/A |
| **DIRECCIÓN \*** | Input Text | Dirección física o calle principal del predio | N/A |
| **DISTRITO \*** | Dropdown / Select | Distrito de Lima Metropolitana donde se ubica el predio | Lista de 43 distritos de Lima |
| **NUMERO DE HPs \*** | Input Number | Cantidad total estimada de hogares o departamentos potenciales | N/A |
| **RESULTADO DE VISITA \*** | Dropdown / Select | Estado o nivel de atención obtenido en el predio visitado | \- VISITA EFECTIVA (HUBO ATENCION POR PARTE DEL PREDIO) 

 \- VISITA NO EFECTIVA (NO HUBO ATENCION / NO TRABAJABLE) |
| **DETALLE DE LA VISITA (QUE SUCEDIO EN EL EDIFICIO) \*** | Textarea | Bitácora o comentarios detallados de lo acontecido en la visita | N/A |

 

**2\. Formulario 2: WIN \- Formato de Asignación**

*Subtítulo UI: "Aquí se realizará la solicitud de asignación o reasignación de los predios visitados."*

| Nombre del CAMPO | Tipo de Campo | Descripción | Opciones Disponibles (si aplica) |
| :---- | :---- | :---- | :---- |
| **NOMBRE DEL HUNTER \*** | Dropdown / Select | Nombre del ejecutivo que solicita la asignación formal | Lista de Hunters Activos |
| **INGRESO \*** | Dropdown / Select | Tipo o canal de procedencia del lead de prospección | Lista de Tipos de Ingreso (Propio, Referido, etc.) |
| **TIPO DE EDIFICIO \*** | Dropdown / Select | Clasificación del tipo de construcción inmobiliaria | Estreno, Moderno, Antiguo |
| **NOMBRE DEL PROYECTO/ EDIFICIO/ CONDOMINIO \*** | Input Text | Nombre oficial para identificar el proyecto inmobiliario | N/A |
| **TIPO DE VIA \*** | Dropdown / Select | Clasificación técnica de la calle pública | Avenida, Calle, Jirón, Pasaje |
| **NOMBRE DE VIA \*** | Input Text | Nombre de la calle, avenida o pasaje correspondiente | N/A |
| **NUMERACIONES DE VIA \*** | Input Text | Número o altura municipal de la puerta de ingreso | N/A |
| **DISTRITO \*** | Dropdown / Select | Distrito de Lima Metropolitana | Lista de 43 distritos |
| **COORDENADAS \*** | Input Text | Coordenadas exactas de geolocalización | Ej. \-12.0397, \-77.0372 |
| **NUMERO DE DEPARTAMENTOS U HOGARES (HPs) \*** | Input Number | Sumatoria total de departamentos o viviendas habitables | N/A |
| **ES EDIFICIO DE ESTRENO? \*** | Radio Buttons | Especifica si el predio acaba de ser construido | Sí, No |
| **FECHA DE MONTANTES Y ACOMETIDAS** | Date Picker | Fecha programada para las Montantes y Acometidas | Formato: DD-MM-YYYY |
| **FECHA DE ENTREGA A PROPIETARIOS** | Date Picker | Fecha programada para la entrega a propietarios | Formato: DD-MM-YYYY |
| **ASIGNAR / REASIGNAR \*** | Dropdown / Select | Tipo de solicitud de exclusividad requerida ante WIN | Asignar, Reasignar |

 

 **3\. Formulario 3: Registro de Fichas \- WIN (Levantamiento Técnico)**

*Ubicación: Captura de pantalla 2026-07-01 224132.png y 224149.png*

*Subtítulo UI: "Aquí se cargarán los datos de los edificios que cuenten con la autorización de accesos para la implementación de fibra óptica de Win."*

| Nombre del CAMPO | Tipo de Campo | Descripción | Opciones Disponibles (si aplica) |
| :---- | :---- | :---- | :---- |
| **NOMBRE DE CANAL \*** | Radio Buttons | División comercial o canal asignado al proyecto | FUTURA, NOVACORE |
| **INGRESO \*** | Dropdown / Select | Canal o tipo de ingreso de la ficha técnica | Lista de Tipos de Ingreso (Futura, Referido, Novacore.) |
| **NOMBRE DEL HUNTER \*** | Dropdown / Select | Nombre del ejecutivo responsable del levantamiento | Lista de Hunters Activos |
| **NOMBRE DEL PROYECTO/ EDIFICIO/ CONDOMINIO \*** | Input Text | Nombre final validado de la infraestructura | N/A |
| **TIPO DE PROYECTO \*** | Dropdown / Select | Tipo de desarrollo constructivo actual | Nuevo Predio, Ampliación de Torre |
| **FUENTE / ORIGEN \*** | Dropdown / Select | Origen de los datos de prospección | Propio |
| **CLASIFICACION \*** | Dropdown / Select | Clasificación del predio según el número de estructuras | Edificio (1-2 torres), Condominio (3+ torres) |
| **TIPO DE CONSTRUCCION \*** | Dropdown / Select | Estado de antigüedad y conservación de la estructura | Estreno, Moderno, Antiguo |
| **JUNTA DIRECTIVA \*** | Radio Buttons | Especifica si cuenta con una junta directiva constituida | Si, No |
| **CARGO DEL RESPONSABLE \*** | Input Text | Puesto o relación del contacto con el predio | Administrador, Presidente de JD, Vigilante, etc. |
| **NOMBRE DEL RESPONSABLE \*** | Input Text | Nombre completo del contacto responsable en el predio | N/A |
| **TELEFONO \- MOVIL DEL RESPONSABLE \*** | Input Text | Número celular del responsable (ingresar sin espacios) | N/A |
| **CORREO DEL RESPONSABLE \*** | Input Text | Correo electrónico de contacto del responsable | N/A |
| **VISITA DE INSPECCION TECNICA \*** | Date Picker | Fecha programada para la validación en campo de WIN | Formato: DD-MM-YYYY |
| **RANGO DE HORARIO DE VISITA \*** | Radio Buttons | Rango de horas asignado para la visita técnica de WIN | 9 AM a 12 AM, 1 PM A 4 PM |
| **DEPARTAMENTO \*** | Radio Buttons | Ubicación geográfica departamental fija | Lima |
| **PROVINCIA \*** | Radio Buttons | Ubicación geográfica provincial fija | Lima |
| **DISTRITO \*** | Dropdown / Select | Distrito de Lima Metropolitana correspondiente | Lista de 43 distritos de Lima |
| **URBANIZACION \*** | Input Text | Nombre de la urbanización, zona, sector o etapa | N/A |
| **CODIGO POSTAL \*** | Input Text | Código de zona postal correspondiente | Ejem: 15419 |
| **TIPO DE VIA \*** | Dropdown / Select | Clasificación de la calle o acceso principal | Avenida, Calle, Jirón, Pasaje |
| **NOMBRE DE VIA \*** | Input Text | Nombre de la vía de acceso principal | N/A |
| **NUMERACION DE VIA \*** | Input Text | Número municipal visible de la puerta de entrada | N/A |
| **COORDENADAS \*** | Input Text | Coordenadas geoespaciales exactas del punto | Ejem: (-12.1, \-77.1) |
| **TOTAL DE TORRES DEL PROYECTO \*** | Input Number | Cantidad total de torres que integran el complejo | N/A |
| **TOTAL DE HOGARES \*** | Input Number | Sumatoria total de departamentos del predio | N/A |
| **NOMBRE DE LA PRIMERA TORRE (TORRE 1\)**  | Input Text | Nombre de la Torre | N/A |
| **CANTIDAD DE PISOS DE LA PRIMERA TORRE (TORRE 1\)**  | Input Number | Cantidad de Pisos de la Torre | 1 o 2 o \+3 |
| **CANTIDAD DE HOGARES POR PISO DE LA PRIMERA TORRE (TORRE 1\)**  | Input Number | Cantidad de Hogares por Piso | Si el número de hogares por piso es distinto colocarlos separados por comas ejemplo: 2,5,4,3,6,5,etc / Si el número de hogares por piso es el mismo para todos los pisos solo colocar el número ejemplo: 3 |
| **NOMBRE DE LA SEGUNDA TORRE (TORRE 2\)**  | Input Text | Nombre de la Torre | N/A |
| **CANTIDAD DE PISOS DE LA SEGUNDA TORRE (TORRE 2\)**  | Input Number | Cantidad de Pisos de la Torre | 1 o 2 o \+3 |
| **CANTIDAD DE HOGARES POR PISO DE LA SEGUNDA TORRE (TORRE 2\)**  | Input Number | Cantidad de Hogares por Piso | Si el número de hogares por piso es distinto colocarlos separados por comas ejemplo: 2,5,4,3,6,5,etc / Si el número de hogares por piso es el mismo para todos los pisos solo colocar el número ejemplo: 3 |
| **NOMBRE DE LA TERCERA TORRE (TORRE 3\)**  | Input Text | Nombre de la Torre | N/A |
| **CANTIDAD DE PISOS DE LA TERCERA TORRE (TORRE 3\)**  | Input Number | Cantidad de Pisos de la Torre | 1 o 2 o \+3 |
| **CANTIDAD DE HOGARES POR PISO DE LA TERCERA TORRE (TORRE 3\)**  | Input Number | Cantidad de Hogares por Piso | Si el número de hogares por piso es distinto colocarlos separados por comas ejemplo: 2,5,4,3,6,5,etc / Si el número de hogares por piso es el mismo para todos los pisos solo colocar el número ejemplo: 3 |
| **NOMBRE DE LA N TORRE (TORRE N)**  | Input Text | Nombre de la Torre | N/A |
| **CANTIDAD DE PISOS DE LA N TORRE (TORRE N)**  | Input Number | Cantidad de Pisos de la Torre | 1 o 2 o \+3 |
| **CANTIDAD DE HOGARES POR PISO DE LA N TORRE (TORRE N)**  | Input Number | Cantidad de Hogares por Piso | Si el número de hogares por piso es distinto colocarlos separados por comas ejemplo: 2,5,4,3,6,5,etc / Si el número de hogares por piso es el mismo para todos los pisos solo colocar el número ejemplo: 3 |
| **NRO DE CLIENTES INTERESADOS** | Input Number | Número inicial de departamentos interesados en el servicio | N/A |
| **FOTO DEL EDIFICIO** | File Input | Archivo o captura fotográfica de la fachada principal | PNG, JPEG, JPG, PDF |
| **FOTO DE LAS MONTANTES (DUCTERIAS) Y ACOMETIDA (MECHA)** | File Input | Archivo fotográfico de las canalizaciones internas | PNG, JPEG, JPG, PDF |

 

