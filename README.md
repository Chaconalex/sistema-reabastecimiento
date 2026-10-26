# Sistema de reabastecimiento — ERP modular

ERP con autenticación, roles y módulos por departamento, desarrollado como prototipo funcional para el proyecto de telecomunicaciones de **Soluciones Informáticas** (Universidad Mariano Gálvez de Guatemala, curso de Telecomunicaciones, 2026). Los módulos están organizados según los departamentos definidos en el diseño del edificio Sixtino II (sección 5.1 del informe).

## Arquitectura

```
proyecto/
├── backend/                 Express + SQL Server (mssql)
│   ├── servidor.js           rutas de la API
│   ├── db.js                  conexión a SQL Server
│   ├── auth.js                 middlewares de autenticación y roles
│   ├── auditoria.js           función reutilizable de bitácora
│   ├── crearUsuario.js       script para crear usuarios (rol/departamento)
│   └── .env                    secretos (NO se sube a git)
└── frontend/                React + Vite + React Router + Recharts
    └── src/
        ├── App.jsx            layout, menú lateral con iconos y rutas
        ├── Login.jsx          pantalla de inicio de sesión
        └── pages/
            ├── Dashboard.jsx        inicio: métricas, accesos rápidos, actividad reciente
            ├── Ventas.jsx            inventario, reorden automático, historial y gráfica de ventas
            ├── Finanzas.jsx          gasto total, gasto por mes (línea) y por producto (pastel)
            ├── Mercadeo.jsx          catálogo de productos con filtro por categoría y promociones
            ├── RRHH.jsx              directorio de empleados
            └── PerfilEmpleado.jsx   perfil individual con historial de auditoría
```

## Autenticación y roles

- Contraseñas guardadas con hash (`bcryptjs`), nunca en texto plano.
- Login devuelve un token **JWT** (`jsonwebtoken`), válido 8 horas.
- Cada ruta protegida exige el token (`requiereLogin`) y, cuando aplica, un rol específico (`requiereRol(...)`).
- Roles funcionales: `administrador`, `compras`, `gerencia`. El campo `Departamento` es informativo (Ventas, Finanzas, Mercadeo, RRHH, Auditoría, Informática, Gerencia).
- Toda acción relevante (login, ventas, recepción de órdenes, cambios de promoción, cambios de estado de empleado) se registra automáticamente en la tabla `Auditoria`, visible solo para `administrador` y `gerencia`.

## Ciclo de negocio

Venta → si el stock cae al punto de reorden, se genera una orden de compra automática → la orden queda pendiente hasta marcarse como **recibida** → al recibirla, el stock se repone y queda registrado en el historial de ventas y en auditoría.

## Cómo correrlo

**Base de datos:** crear `ReabastecimientoDB` en SQL Server con las tablas `Productos`, `Ordenes`, `Usuarios`, `Auditoria` y `VentasRegistro`. Habilitar autenticación mixta y crear un login dedicado para la app.

**Backend**
```bash
cd backend
npm install
npm run dev
```
Corre en `http://localhost:3000` con recarga automática (`nodemon`). Necesita un `.env` con:

Crear el primer usuario administrador:
```bash
node crearUsuario.js "Nombre Completo" correo@ejemplo.com contrasena administrador "Informática"
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Corre en `http://localhost:5173`.

## Endpoints principales de la API

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| POST | `/login` | pública | Autentica y devuelve el JWT |
| GET | `/productos` | pública | Lista el inventario |
| POST | `/productos/:id/vender` | `compras`, `administrador` | Vende unidades; genera orden si aplica |
| POST | `/productos/:id/promocion` | `administrador`, `gerencia` | Activa/desactiva una promoción |
| GET | `/ordenes` | pública | Lista las órdenes de compra |
| POST | `/ordenes/:id/recibir` | `compras`, `administrador` | Marca una orden como recibida y repone stock |
| GET | `/ventas/historial` | login requerido | Últimas 20 ventas registradas |
| GET | `/ventas/resumen` | login requerido | Unidades vendidas agrupadas por producto |
| GET | `/finanzas/resumen` | `administrador`, `gerencia` | Gasto total, por producto y por mes |
| GET | `/usuarios` | login requerido | Directorio de empleados |
| GET | `/usuarios/:id` | login requerido | Perfil individual con actividad reciente |
| POST | `/usuarios/:id/estado` | `administrador` | Activa/desactiva un empleado |
| GET | `/auditoria` | `administrador`, `gerencia` | Bitácora completa de acciones |
| GET | `/dashboard/resumen` | login requerido | Métricas y actividad reciente para el Inicio |

## Relación con el proyecto de telecomunicaciones

Cada módulo corresponde a un departamento del edificio Sixtino II descrito en la sección 5.1 del informe. El módulo de Ventas automatiza el reabastecimiento (sección 5.4), y la bitácora de Auditoría refleja los controles de seguridad y trazabilidad descritos en la sección 5.7.

## Próximos pasos posibles

- Filtro de fechas en el historial de ventas
- Notificaciones cuando un producto llega a su punto de reorden
- Exportar reportes de Finanzas a PDF o Excel
