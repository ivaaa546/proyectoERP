# Plan paso a paso - ERP en Next.js (Fullstack)

## Objetivo
Construir en `ERP/` una aplicacion fullstack con Next.js conectada a SQL Server, usando tus procedimientos almacenados para seguridad, CRUD, ventas, reportes, backups, monitoreo y analytics.

## Estructura actual del proyecto (`ERP/`)
```txt
ERP/
├─ app/
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  └─ logout/route.ts
│  ├─ dashboard/page.tsx
│  ├─ productos/page.tsx
│  ├─ clientes/page.tsx
│  ├─ ventas/page.tsx
│  ├─ reportes/page.tsx
│  ├─ backups/page.tsx
│  ├─ analytics/page.tsx
│  ├─ prediccion/page.tsx
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ api/
│     ├─ health/route.ts
│     ├─ auth/login/route.ts
│     ├─ usuarios/route.ts
│     ├─ productos/route.ts
│     ├─ clientes/route.ts
│     ├─ ventas/route.ts
│     ├─ reportes/pdf/route.ts
│     ├─ reportes/excel/route.ts
│     ├─ backups/generar/route.ts
│     ├─ backups/restaurar/route.ts
│     ├─ analytics/etl/route.ts
│     └─ monitoreo/route.ts
├─ lib/
│  ├─ db.ts
│  ├─ auth.ts
│  ├─ permisos.ts
│  └─ procedures/
│     ├─ auth.ts
│     ├─ productos.ts
│     ├─ clientes.ts
│     └─ ventas.ts
├─ components/
│  ├─ ui/
│  ├─ tablas/
│  ├─ formularios/
│  └─ graficos/
├─ styles/
│  └─ globals.css
├─ types/
│  └─ index.ts
├─ python/
├─ public/
├─ middleware.ts
├─ package.json
├─ tsconfig.json
├─ next.config.ts
├─ next-env.d.ts
├─ .env.example
├─ .gitignore
├─ README.md
└─ plan-implementacion-nextjs.md
```

## Paso 0: Preparacion
1. Crear proyecto Next.js (TypeScript + App Router).
2. Instalar dependencias base: `mssql`, libreria de auth/sesiones, validacion (`zod`) y utilidades de tablas/graficos.
3. Crear `.env.local` con credenciales SQL Server y variables de sesion.
4. Estructurar carpetas base: `app/`, `app/api/`, `lib/`, `components/`, `types/`.

Entregable: app corriendo con `npm run dev` y conexion inicial lista.

## Paso 1: Capa de base de datos
1. Crear `lib/db.ts` con pool de conexion reutilizable para SQL Server.
2. Crear `lib/procedures/` con wrappers para SPs (login, productos, clientes, ventas, backups, monitoreo).
3. Estandarizar manejo de errores SQL y respuestas de API.

Entregable: endpoint de prueba `GET /api/health` validando conexion DB.

## Paso 2: Autenticacion y autorizacion
1. Implementar `POST /api/auth/login` consumiendo `sp_Login`.
2. Guardar sesion segura (cookie httpOnly) con `id_usuario` y `rol`.
3. Crear `middleware.ts` para proteger rutas por rol:
   - Administrador
   - Vendedor
   - Reportes
4. Crear pantalla `/login` y flujo `/logout`.

Entregable: login funcional y rutas bloqueadas por rol.

## Paso 3: Modulo Productos (primer vertical completo)
1. API de productos (`/api/productos`) conectada a SPs CRUD.
2. UI `/productos` con listado, crear y editar.
3. Validaciones cliente/servidor con `zod`.
4. Mensajes de exito/error claros.

Entregable: CRUD de productos de punta a punta.

## Paso 4: Modulo Clientes
1. API `/api/clientes` con SPs de clientes.
2. UI `/clientes` con alta/edicion/listado.
3. Validar documento y telefono.

Entregable: CRUD de clientes funcional.

## Paso 5: Modulo Ventas + Inventario
1. API `/api/ventas` para registrar venta con detalle (SP transaccional).
2. UI `/ventas` para carrito basico y confirmacion de venta.
3. Mostrar errores de stock insuficiente devueltos por trigger/SP.
4. Verificar actualizacion de inventario en flujo real.

Entregable: venta completa con impacto en inventario y auditoria.

## Paso 6: Reportes PDF y Excel
1. API `/api/reportes/pdf` para generar PDF (ventas por fecha, top productos).
2. API `/api/reportes/excel` para exportacion Excel.
3. UI `/reportes` con filtros por rango de fechas y botones de descarga.

Entregable: descargas PDF/Excel funcionando.

## Paso 7: Backups y recuperacion desde app
1. API `/api/backups/generar` usando `sp_GenerarBackup`.
2. API `/api/backups/restaurar` usando `sp_RestaurarBackup`.
3. UI `/backups` con historial (`LogBackups`) y estado.
4. Restringir recuperacion solo a Administrador.

Entregable: backup/restore ejecutables desde interfaz.

## Paso 8: Monitoreo y optimizacion
1. Registrar tiempos en procesos clave con `sp_RegistrarMonitoreo`.
2. UI `/monitoreo` con tabla de tiempos y estado de ejecucion.
3. Medir antes/despues en consultas con indices para evidencia.

Entregable: evidencia de mejora de rendimiento.

## Paso 9: Analytics (DW/OLAP base)
1. API `/api/analytics/etl` para ejecutar carga a `dw`.
2. UI `/analytics` para ejecutar ETL y ver resumen de hechos/dimensiones.
3. Documentar integracion con SSAS (o checklist de configuracion y evidencia de cubo).

Entregable: DW cargado + evidencia de analisis OLAP.

## Paso 10: Prediccion (hacer despues con Python)
1. Crear carpeta `python/` con entrenamiento y prediccion.
2. Exponer endpoint de prediccion e integrarlo en `/prediccion`.
3. Mostrar graficos de tendencia en frontend.

Entregable: modulo IA integrado (fase final).

## Paso 11: Cierre de entrega
1. Completar `docs/diagramaER` y `docs/diccionarioDatos.md`.
2. Crear guia de ejecucion en `ERP/README.md`.
3. Preparar evidencia por rubrica:
   - Seguridad y auditoria
   - Backup y recuperacion
   - Consultas avanzadas
   - Monitoreo e indices
   - Reportes PDF/Excel
   - OLAP
4. Dejar script de demo (orden de ejecucion para presentacion).

Entregable: paquete final listo para evaluacion.

## Orden recomendado (MVP rapido)
1. Paso 0-2 (infra + login + roles)
2. Paso 3-5 (core del negocio)
3. Paso 6-7 (reportes + backups)
4. Paso 8-9 (monitoreo + analytics)
5. Paso 10-11 (IA + cierre)

## Checklist corto de avance
- [ ] Proyecto Next inicializado en `ERP/`
- [ ] Conexion SQL Server estable
- [ ] Login + middleware por rol
- [ ] CRUD Productos
- [ ] CRUD Clientes
- [ ] Registro de ventas con detalle
- [ ] Reportes PDF/Excel
- [ ] Backup/Restore desde app
- [ ] Monitoreo de tiempos
- [ ] ETL DW + evidencia OLAP
- [ ] Modulo de prediccion
- [ ] Documentacion final
