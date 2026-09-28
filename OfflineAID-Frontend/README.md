# OfflineAID Frontend

Aplicación web Angular para reportar emergencias como ciudadano y gestionarlas desde el panel `ADMIN`. El frontend principal de este repositorio es esta carpeta `OfflineAID-Frontend` (la que contiene este README y `src/app`).

## Requisitos

- Node.js y pnpm.
- Backend OfflineAID ejecutándose en `http://localhost:3000` y configurado con su `.env`.

## Desarrollo local

Desde esta carpeta:

```powershell
pnpm install
pnpm start
```

Abre `http://localhost:4200`. El servidor de desarrollo usa `proxy.conf.json` para reenviar las peticiones `/api` al backend en `http://localhost:3000`.

## Vistas y roles

- `CIUDADANO`: reporta emergencias, consulta su historial y sincroniza reportes pendientes al recuperar conexión.
- `ADMIN` y `OPERADOR`: abren el panel para consultar los reportes y cambiar sus estados.

El registro público crea solo cuentas de ciudadano. Las cuentas de personal se preparan mediante el seed o directamente en la base de datos. Otros roles definidos por el esquema, como `INSTITUCION`, no tienen una vista habilitada actualmente.

## Sesión JWT

Al iniciar sesión o registrarse, el backend devuelve un JWT con expiración de 2 horas. `AuthService` guarda el usuario y el token en `localStorage`; el interceptor agrega `Authorization: Bearer <token>` a las llamadas de API, excepto login y registro. Al cerrar sesión se eliminan ambos valores. Si una ruta devuelve `401`, Angular limpia la sesión y vuelve a `/login`.

El token guardado en `localStorage` puede ser leído por JavaScript. No compartas su valor ni capturas legibles del encabezado `Authorization`.

## Verificación

```powershell
pnpm build
pnpm test
```

`pnpm test` ejecuta las pruebas unitarias Angular configuradas por el CLI.