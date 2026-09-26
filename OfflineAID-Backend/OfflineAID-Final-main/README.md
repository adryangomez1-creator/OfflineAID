# OfflineAID Backend

API REST de OfflineAID con TypeScript, Express y MySQL. El backend gestiona reportes de emergencia, autenticación JWT y sincronización de reportes creados sin conexión.

## Requisitos

- Node.js y pnpm.
- MySQL con una base de datos de desarrollo para OfflineAID.

## Configuración

1. Crea la base de datos ejecutando `script.sql` **solo si aceptas borrar la base `offlineaid_in5bm` existente**: el script empieza con `DROP DATABASE IF EXISTS` y la crea nuevamente.
2. Crea un archivo `.env` en esta carpeta, junto a `package.json`. Puedes usar `.env.example` como referencia. Configura las credenciales MySQL y genera un secreto JWT aleatorio desde PowerShell:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   ```

   Ejemplo de configuración:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=offlineaid_in5bm
   JWT_SECRET=pega_aqui_el_secreto_generado
   ```

   No uses el texto de ejemplo como secreto real ni subas `.env` a Git. El backend requiere que `JWT_SECRET` tenga al menos 32 bytes. Si lo cambias, los tokens existentes dejan de funcionar.
3. Instala dependencias e inicializa catálogos y cuentas de prueba si la base está vacía:

   ```powershell
   pnpm install
   pnpm run seed
   ```

   El seed crea cuentas solo cuando la tabla de usuarios está vacía. Las contraseñas se guardan con bcrypt. Las credenciales incluidas en `src/config/seed.ts` son únicamente para desarrollo.
4. Inicia el backend desde esta carpeta, para que dotenv encuentre el `.env`:

   ```powershell
   pnpm run dev
   ```

   Para ejecutar la compilación de producción:

   ```powershell
   pnpm run build
   pnpm start
   ```

La API queda disponible en `http://localhost:3000`.

## Acceso y roles actuales

El registro y el login son públicos. El registro siempre crea usuarios `CIUDADANO`. El login devuelve un JWT válido por 2 horas. Las cuentas `ADMIN` se asignan desde SQL; el backend no permite registrarlas desde la app. Las cuentas con otros roles existentes en el esquema no tienen acceso a las vistas actuales.

Envía el token en el encabezado `Authorization: Bearer <token>` para usar una ruta protegida. El usuario y rol del token se verifican en el servidor. Para reportar, consultar historial o sincronizar, la identidad se toma del token y no del `id_usuario` enviado por el cliente.

| Acceso | Método y ruta | Uso |
|---|---|---|
| Público | `GET /` | Estado de la API. |
| Público | `POST /api/auth/registro` | Crear cuenta de ciudadano; devuelve usuario y token. |
| Público | `POST /api/auth/login` | Iniciar sesión; devuelve usuario y token. |
| Público | `GET /api/news` | Consultar noticias y alertas. |
| `CIUDADANO` | `POST /api/emergencias/reportar` | Crear un reporte con datos y evidencias. |
| `CIUDADANO` | `GET /api/emergencias/usuario/:id_usuario` | Consultar el historial propio. El servidor ignora el ID de la ruta y usa el token. |
| `CIUDADANO` | `POST /api/sync/batch` | Sincronizar reportes pendientes; el servidor asocia las operaciones al usuario del token. |
| `CIUDADANO` | `POST /api/ubicacion/geocodificar` | Obtener una dirección a partir de coordenadas. |
| `ADMIN` | `GET /api/emergencias` | Consultar los reportes para el panel de gestión. |
| `ADMIN` | `PUT` o `PATCH /api/emergencias/:id/estado` | Cambiar el estado de un reporte. |

Las demás rutas API no están habilitadas en esta versión y responden con acceso denegado. Los guards de Angular ayudan a controlar la navegación, pero los permisos se aplican en el backend.

## Frontend

El frontend principal está en `OfflineAID-Frontend`. Su proxy `/api` apunta a `http://localhost:3000`. Inicia el backend y, en otra terminal, ejecuta desde la carpeta del frontend:

```powershell
pnpm install
pnpm start
```

Abre `http://localhost:4200`.

Angular conserva el token en `localStorage` para mantener la sesión después de recargar y lo adjunta a las llamadas protegidas. Cerrar sesión elimina el token. El token se expone a JavaScript; no lo compartas ni publiques capturas que muestren el encabezado `Authorization`.

## Pruebas

```powershell
pnpm test
```

La suite de integración usa la base indicada en `.env`, puede poblar catálogos y cuentas si están vacíos, crea un reporte de prueba y cambia el estado de un reporte a `EN_PROCESO`. **No la ejecutes contra una base con datos que debas preservar**; configura una base aislada de pruebas antes de correrla.

## Funcionalidades fuera del acceso actual

El esquema y algunos controladores conservan CRUD genérico, cola administrativa, asignaciones, notificaciones, estadísticas y operaciones institucionales de fases anteriores. Esas rutas no están montadas en la API activa. Para habilitar alguna, primero hay que definir sus permisos y agregar pruebas de autorización.