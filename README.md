# Sistema de reabastecimiento — ERP modular

ERP con autenticación y módulos por departamento, desarrollado como prototipo funcional para el proyecto de telecomunicaciones de **Soluciones Informáticas** (Universidad Mariano Gálvez de Guatemala, curso de Telecomunicaciones, 2026). Los módulos están organizados según los departamentos definidos en el diseño del edificio Sixtino II (sección 5.1 del informe).

## Arquitectura

```
proyecto/
├── backend/                Express + SQL Server (mssql)
│   ├── servidor.js          rutas de la API
│   ├── db.js                 conexión a SQL Server
│   ├── auth.js                middlewares de autenticación y roles
│   ├── auditoria.js          función reutilizable de bitácora
│   ├── crearUsuario.js      script para crear usuarios (rol/departamento)
│   └── .env                   secretos (NO se sube a git)
└── frontend/               React + Vite + React Router
    └── src/
        ├── App.jsx           layout, menú lateral y rutas
        ├── Login.jsx         pantalla de inicio de sesión
        └── pages/
            ├── Ventas.jsx       inventario y reorden automático
            ├── RRHH.jsx          directorio de empleados
            ├── Auditoria.jsx    bitácora de acciones (admin/gerencia)
            ├── Finanzas.jsx     (en construcción)
            └── Mercadeo.jsx     (en construcción)
```

## Autenticación y roles

- Contraseñas guardadas con hash (`bcryptjs`), nunca en texto plano.
- Login devuelve un token **JWT** (`jsonwebtoken`), válido 8 horas.
- Cada ruta protegida exige el token (`requiereLogin`) y, cuando aplica, un rol específico (`requiereRol(...)`).
- Roles actuales: `administrador`, `compras`, `gerencia`.
- Toda acción relevante (login, ventas) se registra automáticamente en la tabla `Auditoria`, visible solo para `administrador` y `gerencia`.

## Cómo correrlo

**Base de datos:** crear `ReabastecimientoDB` en SQL Server con las tablas `Productos`, `Ordenes`, `Usuarios` y `Auditoria` (ver scripts SQL del proyecto). Habilitar autenticación mixta y crear un login dedicado para la app.

**Backend**
```bash
cd backend
npm install
node servidor.js
```
Corre en `http://localhost:3000`. Necesita un archivo `.env` con:
```
JWT_SECRET=una-clave-larga-y-dificil-de-adivinar
```

Crear el primer usuario administrador:
```bash
node crearUsuario.js "Nombre Completo" correo@ejemplo.com contrasena administrador
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Corre en `http://localhost:5173`.

## Endpoints de la API

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| POST | `/login` | pública | Autentica y devuelve el JWT |
| GET | `/productos` | pública | Lista el inventario |
| POST | `/productos/:id/vender` | `compras`, `administrador` | Vende unidades; genera orden si aplica |
| GET | `/ordenes` | pública | Lista las órdenes de compra generadas |
| GET | `/usuarios` | login requerido | Directorio de empleados |
| GET | `/auditoria` | `administrador`, `gerencia` | Bitácora de acciones del sistema |

## Relación con el proyecto de telecomunicaciones

Cada módulo corresponde a un departamento del edificio Sixtino II descrito en la sección 5.1 del informe (Ventas, Informática, RRHH, Finanzas, Mercadeo, Auditoría). El módulo de Ventas automatiza el reabastecimiento (sección 5.4), y la bitácora de Auditoría refleja los controles de seguridad y trazabilidad descritos en la sección 5.7.

## Próximos pasos

- Módulo de Finanzas: reporte de gasto por proveedor y por mes
- Módulo de Mercadeo: marcar productos en promoción
- `nodemon` para recarga automática del backend en desarrollo
- Endpoint para marcar una orden como "recibida"
