# ERP Next.js Structure

Estructura base fullstack en Next.js para front y backend.

## Como ejecutar
1. Copia variables:
   - `cp .env.example .env.local`
2. Instala dependencias:
   - `npm install`
3. Levanta entorno dev:
   - `npm run dev`

## Carpetas clave
- `app/`: vistas y rutas API
- `app/api/`: endpoints para login, CRUD, backups, analytics
- `lib/`: conexion DB, auth y permisos
- `lib/procedures/`: wrappers de stored procedures
- `components/`: UI reutilizable
- `types/`: tipos compartidos

## Endpoints base disponibles
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/productos`
- `GET /api/clientes`
- `GET /api/ventas`
- `GET /api/usuarios`
- `POST /api/backups/generar`
- `POST /api/backups/restaurar`
- `POST /api/analytics/etl`
- `GET /api/monitoreo`

## Nota
La autenticacion actual es base para arrancar rapido. Luego puedes endurecer sesion/JWT, hashing real y validaciones avanzadas.
