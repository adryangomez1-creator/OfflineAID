# OfflineAID

Aplicación para reportar y gestionar emergencias, con soporte para preparar reportes sin conexión y sincronizarlos cuando vuelve la conectividad.

## Estructura principal

- `OfflineAID-Backend/OfflineAID-Final-main`: API TypeScript, Express y MySQL. Consulta su [README](OfflineAID-Backend/OfflineAID-Final-main/README.md) para instalar, configurar `JWT_SECRET`, preparar la base de datos y conocer las rutas habilitadas.
- `OfflineAID-Frontend`: aplicación Angular principal. Consulta su [README](OfflineAID-Frontend/README.md) para ejecutarla y revisar el flujo de sesión.

La carpeta `OfflineAID-Frontend/Frontend` contiene un scaffold Angular SSR separado; no es la aplicación principal que se describe aquí.

## Inicio rápido

1. Configura y arranca el backend siguiendo su README. Necesita MySQL y un `.env` local.
2. En otra terminal, entra a `OfflineAID-Frontend` y ejecuta `pnpm install` y `pnpm start`.
3. Abre `http://localhost:4200`.

El proxy de Angular reenvía `/api` al backend local en el puerto `3000`. La aplicación tiene una vista ciudadana y un panel `ADMIN`; las cuentas ciudadanas se registran desde la app y las cuentas `ADMIN` se preparan desde SQL.