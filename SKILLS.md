# Procedimientos y prompts de migración

Cada bloque es una instrucción de trabajo copiable. Las etapas se integran en `development`. El [System Design](docs/SYSTEM-DESIGN.md) contiene el inventario, el modelo y la secuencia de cambio de base. La etapa cero se entregó con este documento. Las demás son trabajo futuro.

**Contexto común para todos los prompts**

> Trabaja en el repositorio arromero4/Arbodex sobre development, con ajuste-demo en 33c9e25 como referencia. Lee AGENTS.md, SKILLS.md y docs/SYSTEM-DESIGN.md. Ejecuta solo la etapa indicada. Conserva los QR, el piloto y el registro de asistencias. Usa datos sintéticos y servicios locales. Al terminar entrega el cambio, sus pruebas, qué ocurrió si algo falló, cómo revertirlo y qué permite pasar a la siguiente etapa. Registra diferencias entre lo observado, lo propuesto y lo comprobado en ejecución.

### 0. Actualizar el diagnóstico y presentar el diseño

> Contrasta el árbol y el historial de main, ajuste-demo y development. Inventaría fuentes, paquete publicado, recursos, configuración, reglas, pruebas y dependencias externas. Traza por separado la aplicación principal y la demo. Actualiza la matriz de permisos y el diseño si encuentras nueva evidencia. Presenta el recorrido de una asistencia y explica la decisión Firebase Auth / Firestore / MySQL con sus costes operativos. Para cerrar, enlaza las evidencias y enumera las incógnitas que requieren información del operador.

### 1. Capturar el comportamiento que hay que conservar

> Construye datos sintéticos para dos miembros, un organizador habilitado, otro deshabilitado y un visitante. Caracteriza login, verificación, alta y edición de tarjeta, QR con UUID completo, año, 12 meses y tres especiales, progreso e historial, creación y anulación de encuentro y reemplazo de sello. Recrea pruebas de permisos en Auth y Firestore Emulator con la base nombrada default y comprueba una denegación esperada antes de fiarte de la configuración. Caracteriza la demo y su persistencia local por separado. Si el bundle carece de selector de emuladores, usa el SDK de pruebas contra el emulador y fixtures de UI locales. Cierra con resultados reproducibles y una lista explícita de las rutas todavía comprobadas solo por inspección.

### 2. Preparar el entorno multiplataforma

> Crea un workspace npm con apps/web (React y TypeScript), apps/api (Node.js y TypeScript), packages/contracts y scripts portables. Fija versiones compatibles de Node LTS, CLI de Firebase y MySQL, añade lockfile, ejemplo de entorno y validación al arrancar. Usa un perfil local explícito demo-arbodex, Auth en 9099, Firestore en 8085 y MySQL InnoDB con volumen local. Sirve el cliente nuevo en una ruta o puerto de desarrollo separado del build de referencia. Ofrece instalación limpia, dev, typecheck, test y build desde PowerShell y una shell POSIX. En CI verifica el cliente y los scripts en Windows, macOS y Linux y la integración con servicios en runners compatibles. Cierra con una instalación reproducible y registra qué plataformas se ejecutaron de verdad.

### 3. Llevar identidad y permisos al backend

> Crea /api/v1 y un contrato tipado con validación en tiempo de ejecución. Implementa primero la lectura del pase contra Firestore a través de Node. En el cliente, usa Firebase Auth para Google y correo y obtén el ID token con el SDK. En el servidor, usa Admin SDK con proyecto y databaseId explícitos, exige correo verificado, valida propiedad o rol habilitado y filtra los campos de salida. Considera la revocación de sesión en operaciones privilegiadas. Mantén las reglas del cliente legado mientras esté activo. Prueba permisos con identidades sintéticas, token vencido y cambios de rol, y registra latencia y errores sin datos personales. Cierra cuando el nuevo contrato reproduzca la lectura permitida y las denegaciones esperadas. La ruta anterior sigue disponible durante el ensayo.

### 4. Reconstruir el ArboPass en React y TypeScript

**Incidencia del paquete.** Resolver el arte de enero y octubre de 2026 o acordar una alternativa con el Capitán. Probar que los quince sellos del portal carguen recursos válidos.

> Implementa los flujos de miembro contra el contrato de la API. Conecta alta y edición de perfil con el adaptador Firestore y conserva la creación atómica de cuenta y tarjeta. Reconstruye acceso, recuperación y verificación, QR y enlace heredado, selector anual, sellos, progreso e historial. Mantén las actualizaciones de un sello tras un check-in o anulación con una estrategia de refresco medible. Traduce al frontend los tokens y variantes verificados en Figma. Usa la identidad y los recursos existentes y define la vista de móvil y escritorio. Valida teclado, foco en diálogos, anuncios de estado y movimiento reducido. Prueba que la demo siga siendo local y que sus registros nunca aparezcan en el pase real. Activa la nueva interfaz detrás de una opción reversible hasta alcanzar paridad.

### 5. Implementar organizadores, eventos y sellos

> Añade a Node y React el listado acotado de eventos, alta de evento, anulación motivada, búsqueda por UUID/enlace y confirmación de asistencia. Empieza con el adaptador Firestore y replica las invariantes que aplicaba firestore.rules. Implementa idempotencia en el servidor, autor y hora del servidor, comprobación del permiso vigente y reemplazo con archivo atómico. Ensaya dos confirmaciones concurrentes, una anulación simultánea y el reintento tras perder la respuesta. Cierra cuando el resultado sea un sello válido por casilla y un historial inmutable. Demuestra que ambos clientes pueden atender a sus usuarios durante la transición y prepara la actualización de sesiones antiguas con escrituras directas.

### 6. Preparar MySQL y ensayar la migración

> Implementa el mismo contrato con MySQL/InnoDB, restricciones, transacciones, consultas parametrizadas y migraciones versionadas. Importa desde una copia autorizada o desde fixtures, incluyendo organizadores sin tarjeta, subcolecciones e historial. Conserva UID, UUID, años, casillas, actores, motivos e instantes originales. Añade simulación, checkpoints y reejecución idempotente. Concilia por clave y contenido además de contar filas. Ensaya una fuente vacía y otra con casos antiguos, anulados y concurrentes. Ejecuta la misma suite sobre ambos adaptadores, compara las lecturas en sombra y ensaya restauración. Cierra con discrepancias de negocio a cero y evidencia de que se puede volver tras recibir escrituras nuevas.

### 7. Cambiar el escritor manteniendo disponible el registro

> Ensaya primero en el entorno local o de ensayo el protocolo del System Design. Enruta los clientes activos por la API, instrumenta los clientes anteriores, verifica el bloqueo efectivo de escrituras directas y que puedan actualizarse y continuar. Captura cambios confirmados, importa la base y reproduce los cambios en orden. Usa un control transaccional de escritor e idempotencia para aceptar solicitudes durante el relevo. Confirma una asistencia únicamente después de su commit. Mide errores, retraso, duplicados y divergencias y prueba el retorno con registros creados a ambos lados del relevo. Entrega el runbook con decisión de continuar o volver. La ejecución sobre el proyecto real requiere identificar el entorno y solicitar expresamente ese cambio.

### 8. Cerrar el piloto y preparar operación

> Verifica copia y restauración, alertas de errores de autorización y check-in, latencia, conexiones SQL, retraso de réplica y coste por encuentro. Revisa rotación de identidad de servicio, dependencias, caché y política de recursos externos. Documenta soporte diario, alta y baja de organizadores, diagnóstico en Windows/macOS/Linux y recuperación. Tras la ventana acordada de observación, retira solo los caminos que ya no tengan consumidores y aplica la política acordada de conservación de Firestore. Actualiza Figma, el System Design y el estado de cada etapa. Cierra con una demostración de registro, anulación, sustitución y recuperación usando datos sintéticos.
