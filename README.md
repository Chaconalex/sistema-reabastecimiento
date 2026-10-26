# 🏢 Sistema de Reabastecimiento — ERP Modular

Sistema ERP modular desarrollado como prototipo funcional para el proyecto de **Telecomunicaciones de Soluciones Informáticas**, de la Universidad Mariano Gálvez de Guatemala, durante el año 2026.

La aplicación permite administrar el inventario, automatizar el reabastecimiento de productos, gestionar empleados por departamento, consultar información financiera y registrar las operaciones mediante una bitácora de auditoría.

El sistema está organizado según los departamentos definidos en el diseño del edificio Sixtino II, integrando funcionalidades de autenticación, autorización por roles y control de operaciones.

---

## 📋 Tabla de contenidos

- [Características principales](#-características-principales)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del proyecto](#-arquitectura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración de SQL Server](#-1-configuración-de-sql-server)
- [Configuración del backend](#-2-configuración-del-backend)
- [Creación del administrador](#-3-creación-del-usuario-administrador)
- [Configuración del frontend](#-4-configuración-del-frontend)
- [Módulos del sistema](#-módulos-del-sistema)
- [Autenticación y seguridad](#-autenticación-y-seguridad)
- [Proceso de reabastecimiento](#-proceso-de-reabastecimiento)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Estructura de la base de datos](#-estructura-de-la-base-de-datos)
- [Solución de problemas](#-solución-de-problemas)
- [Relación con el proyecto académico](#-relación-con-el-proyecto-académico)
- [Autores y contexto académico](#-autores-y-contexto-académico)

---

## 🚀 Características principales

- Autenticación de usuarios mediante correo electrónico y contraseña.
- Contraseñas protegidas mediante hash con `bcryptjs`.
- Autenticación basada en tokens JWT.
- Control de acceso según roles y permisos.
- Gestión de inventario de productos.
- Generación automática de órdenes de compra al alcanzar el punto de reorden.
- Recepción de órdenes y actualización del inventario.
- Registro del historial de ventas.
- Panel principal con indicadores y actividad reciente.
- Módulo financiero con gráficos de gastos.
- Catálogo de productos y gestión de promociones.
- Directorio de empleados.
- Administración de perfiles y estados de empleados.
- Bitácora de auditoría con filtros y exportación a CSV.
- Interfaz web desarrollada con React y Vite.
- API REST desarrollada con Node.js y Express.
- Persistencia de datos mediante Microsoft SQL Server.

---

## 🛠️ Tecnologías utilizadas

### Backend

| Tecnología | Función |
|---|---|
| Node.js | Entorno de ejecución de JavaScript |
| Express.js | Desarrollo de la API REST |
| Microsoft SQL Server | Sistema gestor de base de datos |
| `mssql` | Conexión entre Node.js y SQL Server |
| `bcryptjs` | Hash de contraseñas |
| `jsonwebtoken` | Generación y validación de tokens JWT |
| `dotenv` | Administración de variables de entorno |
| Nodemon | Reinicio automático del servidor durante el desarrollo |

### Frontend

| Tecnología | Función |
|---|---|
| React | Desarrollo de la interfaz de usuario |
| Vite | Servidor de desarrollo y herramientas de compilación |
| React Router | Navegación entre páginas |
| Recharts | Visualización de gráficos |
| Lucide React | Iconografía de la interfaz |
| CSS | Diseño y estilos visuales |

### Herramientas recomendadas

- Visual Studio Code.
- Git.
- GitHub.
- Node.js y npm.
- Microsoft SQL Server.
- SQL Server Management Studio (SSMS).

---

## 📁 Arquitectura del proyecto

```text
proyecto/
│
├── backend/
│   ├── servidor.js
│   ├── db.js
│   ├── auth.js
│   ├── auditoria.js
│   ├── crearUsuario.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env                  # No subir a GitHub
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   ├── layout.css
│   │   │
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Ventas.jsx
│   │       ├── Finanzas.jsx
│   │       ├── Mercadeo.jsx
│   │       ├── RRHH.jsx
│   │       ├── PerfilEmpleado.jsx
│   │       └── Auditoria.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

**Nota:** La estructura representa la organización prevista del proyecto. Conserva únicamente los archivos que realmente existan en tu repositorio y agrega los archivos SQL de creación de tablas si los tienes.

---

## 💻 Requisitos previos

Antes de instalar el proyecto, asegúrate de tener:

1. Node.js instalado.
2. npm disponible desde la terminal.
3. Microsoft SQL Server instalado y funcionando.
4. SQL Server Management Studio (SSMS), recomendado para administrar la base de datos.
5. Git instalado para clonar y administrar el repositorio.
6. Un editor de código, como Visual Studio Code.

Comprueba la instalación de Node.js, npm y Git ejecutando:

```bash
node --version
npm --version
git --version
```

Si los comandos muestran las versiones correspondientes, puedes continuar.

---

## ⚙️ Instalación

### 1. Clonar el repositorio

Desde una terminal, ejecuta:

```bash
git clone URL_DE_TU_REPOSITORIO
```

Ingresa a la carpeta del proyecto:

```bash
cd nombre-del-repositorio
```

Reemplaza `URL_DE_TU_REPOSITORIO` por la dirección real de tu repositorio de GitHub.

Si ya tienes el proyecto descargado en tu computadora, puedes omitir este paso.

---

### 2. Configuración de SQL Server

Abre SQL Server Management Studio y conéctate a tu instancia de SQL Server.

Crea una base de datos llamada:

```sql
CREATE DATABASE ReabastecimientoDB;
GO
```

La aplicación necesita las siguientes tablas:

| Tabla | Descripción |
|---|---|
| `Productos` | Catálogo e inventario de productos |
| `Ordenes` | Órdenes de compra y su estado |
| `Usuarios` | Usuarios, roles y departamentos |
| `Auditoria` | Registro de acciones realizadas |
| `VentasRegistro` | Historial de ventas |

**Importante:** La creación de la base de datos no crea automáticamente las tablas. Debes ejecutar los scripts SQL de estructura e inicialización correspondientes al proyecto antes de utilizar la aplicación.

#### Configurar el acceso

Configura SQL Server para aceptar conexiones desde la aplicación Node.js.

Si utilizas autenticación de SQL Server, verifica que:

- La autenticación mixta esté habilitada.
- El servicio de SQL Server esté iniciado.
- El puerto configurado sea correcto.
- El usuario de la aplicación tenga los permisos necesarios sobre `ReabastecimientoDB`.

Por seguridad, es preferible utilizar un usuario específico para la aplicación en lugar de utilizar la cuenta `sa`.

---

### 3. Configuración del backend

Abre una terminal y accede a la carpeta del backend:

```bash
cd backend
```

Instala las dependencias:

```bash
npm install
```

#### Crear el archivo `.env`

Dentro de la carpeta `backend`, crea un archivo llamado `.env`.

Agrega la configuración de conexión:

```env
PORT=3000

DB_USER=usuario_sql
DB_PASSWORD=TuPasswordSeguro
DB_SERVER=localhost
DB_DATABASE=ReabastecimientoDB
DB_PORT=1433

JWT_SECRET=reemplaza_esta_clave_por_una_clave_secreta_segura
```

#### Descripción de las variables

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor Express |
| `DB_USER` | Usuario de SQL Server |
| `DB_PASSWORD` | Contraseña del usuario de SQL Server |
| `DB_SERVER` | Servidor o instancia de SQL Server |
| `DB_DATABASE` | Base de datos utilizada |
| `DB_PORT` | Puerto TCP de SQL Server |
| `JWT_SECRET` | Clave secreta utilizada para firmar los tokens JWT |

**Importante:** Los valores anteriores son ejemplos. Debes sustituirlos por la configuración de tu entorno.

Si utilizas una instancia con nombre, como `SQLEXPRESS`, revisa cómo está configurada la conexión en `db.js`, ya que puede requerir ajustes adicionales.

#### Iniciar el backend

Ejecuta:

```bash
npm run dev
```

El servidor debería estar disponible en:

```text
http://localhost:3000
```

El comando `npm run dev` requiere que esté definido en `backend/package.json` y que Nodemon se encuentre instalado.

Por ejemplo, la sección de scripts puede incluir:

```json
{
  "scripts": {
    "dev": "nodemon servidor.js",
    "start": "node servidor.js"
  }
}
```

Si el proyecto ya cuenta con estos scripts, no es necesario modificarlos.

---

### 4. Creación del usuario administrador

Una vez configurada la conexión a SQL Server, crea el primer usuario administrador.

Desde la carpeta `backend`, ejecuta:

```bash
node crearUsuario.js "Nombre Completo" correo@ejemplo.com "ContrasenaSegura" administrador "Informática"
```

#### Parámetros

| Parámetro | Ejemplo |
|---|---|
| Nombre | `Nombre Completo` |
| Correo | `correo@ejemplo.com` |
| Contraseña | `ContrasenaSegura` |
| Rol | `administrador` |
| Departamento | `Informática` |

Reemplaza los valores de ejemplo por los datos correspondientes.

El script `crearUsuario.js` debe estar preparado para recibir estos argumentos, generar el hash de la contraseña y registrar el usuario en la base de datos.

**Recomendación:** No utilices contraseñas reales en comandos que puedan quedar guardados en el historial de la terminal. Utiliza una contraseña temporal segura y cámbiala cuando corresponda.

---

### 5. Configuración del frontend

Abre una segunda terminal y accede a la carpeta del frontend:

```bash
cd frontend
```

Instala las dependencias:

```bash
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La interfaz estará disponible normalmente en:

```text
http://localhost:5173
```

Abre esta dirección en tu navegador.

Inicia sesión con las credenciales del usuario administrador que creaste anteriormente.

Si la aplicación no puede comunicarse con el backend, revisa la configuración de la URL de la API, las rutas utilizadas por los componentes y la configuración CORS de Express.

**Importante:** Mantén abiertas las dos terminales mientras trabajas en modo desarrollo: una para el backend y otra para el frontend.

---

## 🧩 Módulos del sistema

### 1. Dashboard

Panel principal que presenta información resumida del sistema.

Características:

- Indicadores KPI.
- Accesos rápidos a los módulos.
- Actividad reciente.
- Resumen de operaciones registradas en la bitácora.

### 2. Ventas y reabastecimiento

Módulo encargado de controlar el inventario y automatizar el proceso de reabastecimiento.

Características:

- Consulta de productos.
- Registro de ventas.
- Control de existencias.
- Generación automática de órdenes de compra al alcanzar el punto de reorden.
- Consulta de órdenes pendientes.
- Recepción de órdenes de compra.
- Historial de ventas.

### 3. Finanzas

Módulo orientado a la consulta de información financiera.

Características:

- Consulta del gasto total.
- Análisis de gastos por mes.
- Análisis de gastos por producto.
- Visualización mediante gráficos.

El acceso está restringido a los roles autorizados.

### 4. Mercadeo

Módulo para la consulta del catálogo y la administración de promociones.

Características:

- Catálogo de productos.
- Filtros por categoría.
- Consulta de información de productos.
- Activación y desactivación de promociones.
- Registro de cambios relevantes en auditoría.

### 5. Recursos Humanos

Módulo de consulta y administración del directorio de empleados.

Características:

- Listado de colaboradores.
- Consulta de perfiles.
- Registro de nuevos empleados.
- Edición de información.
- Activación y desactivación de empleados.

Las operaciones de creación, edición y cambio de estado están reservadas al administrador.

### 6. Perfil del empleado

Permite consultar la información individual de un colaborador.

Características:

- Información del empleado.
- Estado de la cuenta.
- Historial de actividad.
- Consulta de eventos de auditoría relacionados.

### 7. Auditoría

Módulo que permite consultar las acciones registradas en el sistema.

Características:

- Consulta de eventos.
- Filtros de búsqueda.
- Historial de operaciones.
- Registro de actividad relevante.
- Exportación de información a CSV.

El acceso está reservado a los roles administrador y gerencia.

---

## 🔐 Autenticación y seguridad

El sistema implementa mecanismos básicos de autenticación y control de acceso.

### Contraseñas

Las contraseñas se almacenan mediante hashes generados con `bcryptjs`, evitando guardarlas directamente en texto plano.

### Tokens JWT

Después de una autenticación correcta, el backend devuelve un token JWT con una vigencia prevista de ocho horas.

El frontend utiliza el token para realizar las solicitudes protegidas.

### Middleware de autenticación

El archivo `auth.js` contiene los middlewares encargados de validar la sesión y controlar el acceso según el rol.

- `requiereLogin`: verifica la autenticación.
- `requiereRol(...)`: restringe el acceso según los roles permitidos.

### Roles funcionales

| Rol | Permisos generales |
|---|---|
| `administrador` | Acceso completo y administración de empleados |
| `compras` | Operaciones autorizadas de ventas, inventario y recepción de órdenes |
| `gerencia` | Consulta de información financiera, auditoría y funciones autorizadas |

Los permisos definitivos dependen de las restricciones implementadas en cada endpoint.

### Departamentos

El campo de departamento identifica el área a la que pertenece cada colaborador.

Los departamentos contemplados son:

- Ventas.
- Finanzas.
- Mercadeo.
- Recursos Humanos.
- Auditoría.
- Informática.
- Gerencia.

El departamento es informativo; los permisos funcionales se determinan mediante el rol.

### Bitácora de auditoría

Las operaciones relevantes pueden registrarse en la tabla `Auditoria`, incluyendo:

- Inicio de sesión.
- Ventas.
- Recepción de órdenes.
- Cambios de promociones.
- Creación y edición de usuarios.
- Cambios de estado de empleados.

El archivo `auditoria.js` centraliza la función reutilizable de registro de eventos.

---

## 🔄 Proceso de reabastecimiento

El proceso de negocio principal sigue este flujo:

```text
┌──────────────────────────┐
│ 1. Consulta de inventario│
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ 2. Registro de una venta │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────────┐
│ 3. Actualización de existencias│
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ 4. ¿Alcanza el punto de      │
│    reorden configurado?      │
└────────────┬─────────────────┘
             │
       ┌─────┴─────┐
       │           │
      No          Sí
       │           │
       ▼           ▼
┌────────────┐  ┌─────────────────────┐
│ Continúa   │  │ 5. Generación de una│
│ operación  │  │    orden de compra  │
│ normal     │  └──────────┬──────────┘
└────────────┘             │
                           ▼
               ┌──────────────────────┐
               │ 6. Orden pendiente   │
               └──────────┬───────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │ 7. Recepción de orden│
               └──────────┬───────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │ 8. Reposición de     │
               │    existencias       │
               └──────────┬───────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │ 9. Registro en       │
               │    historial y       │
               │    auditoría         │
               └──────────────────────┘
```

El sistema automatiza la generación de órdenes de compra cuando se cumple la condición de reorden configurada para cada producto.

La recepción de una orden permite actualizar las existencias y conservar la trazabilidad de la operación.

---

## 🌐 Endpoints de la API

La API utiliza rutas HTTP para consultar información y ejecutar operaciones del sistema.

**URL base de desarrollo:**

```text
http://localhost:3000
```

### Autenticación y dashboard

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| POST | `/login` | Pública | Autentica al usuario y devuelve el JWT |
| GET | `/dashboard/resumen` | Login requerido | Consulta las métricas y la actividad reciente |

### Productos y ventas

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/productos` | Pública | Consulta el inventario |
| POST | `/productos/:id/vender` | Compras, administrador | Registra una venta y genera una orden cuando corresponde |
| POST | `/productos/:id/promocion` | Administrador, gerencia | Activa o desactiva una promoción |
| GET | `/ventas/historial` | Login requerido | Consulta las últimas 20 ventas |
| GET | `/ventas/resumen` | Login requerido | Agrupa las unidades vendidas por producto |

### Órdenes de compra

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/ordenes` | Pública | Consulta las órdenes de compra |
| POST | `/ordenes/:id/recibir` | Compras, administrador | Marca una orden como recibida y repone existencias |

### Finanzas

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/finanzas/resumen` | Administrador, gerencia | Consulta gastos totales, por producto y por mes |

### Usuarios y empleados

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/usuarios` | Login requerido | Consulta el directorio de empleados |
| GET | `/usuarios/:id` | Login requerido | Consulta el perfil de un empleado |
| POST | `/usuarios` | Administrador | Crea un empleado |
| PUT | `/usuarios/:id` | Administrador | Edita los datos o la contraseña |
| POST | `/usuarios/:id/estado` | Administrador | Activa o desactiva una cuenta |

### Auditoría

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/auditoria` | Administrador, gerencia | Consulta la bitácora de acciones |

**Nota:** Las protecciones indicadas reflejan el diseño previsto de la API. Verifica las rutas reales en `servidor.js` y los middlewares de `auth.js` antes de utilizar esta tabla como documentación definitiva. Los endpoints públicos de consulta deben revisarse para determinar si necesitan autenticación.

---

## 🗄️ Estructura de la base de datos

La base de datos `ReabastecimientoDB` almacena la información necesaria para el funcionamiento del ERP.

### Productos

Contiene los datos del catálogo y las existencias disponibles.

Permite controlar el inventario y evaluar cuándo es necesario generar una orden de compra.

### Ordenes

Almacena las órdenes de compra generadas por el sistema.

Permite identificar las órdenes pendientes y registrar su recepción.

### Usuarios

Contiene la información de los usuarios del sistema, sus credenciales protegidas, roles, departamentos y estado de la cuenta.

### Auditoria

Registra las acciones relevantes realizadas por los usuarios y permite consultar la trazabilidad de las operaciones.

### VentasRegistro

Almacena el historial de ventas para realizar consultas y generar resúmenes.

**Importante:** Los campos, tipos de datos, claves primarias, claves foráneas e índices deben consultarse en el script SQL real de creación de tablas.

---

## 🧰 Solución de problemas

### Error: `Login failed for user`

Comprueba que el usuario y la contraseña configurados en `.env` sean correctos y que la autenticación de SQL Server esté habilitada.

### Error: `Cannot find module`

Instala las dependencias desde la carpeta correspondiente:

```bash
npm install
```

### Error: `Invalid object name`

Verifica que la base de datos esté seleccionada correctamente y que las tablas existan dentro de `ReabastecimientoDB`.

### Error de conexión con SQL Server

Comprueba:

- Que el servicio de SQL Server esté iniciado.
- Que el servidor y el puerto sean correctos.
- Que TCP/IP esté habilitado cuando corresponda.
- Que el firewall permita las conexiones necesarias.
- Que las variables de entorno coincidan con la configuración de `db.js`.

### El frontend no se conecta al backend

Comprueba que ambos servidores estén ejecutándose y que las solicitudes del frontend apunten a:

```text
http://localhost:3000
```

También verifica la configuración CORS y los errores que aparezcan en la consola del navegador.

### El usuario administrador no puede iniciar sesión

Comprueba que el usuario se haya registrado correctamente, que el hash de la contraseña sea válido y que el backend utilice el mismo mecanismo de autenticación configurado en `crearUsuario.js`.

---

## 🎓 Relación con el proyecto académico

El sistema forma parte del proyecto de Telecomunicaciones de Soluciones Informáticas de la Universidad Mariano Gálvez de Guatemala.

Su diseño toma como referencia la distribución departamental del edificio Sixtino II, descrita en la sección 5.1 del informe académico.

La relación con el proyecto se establece de la siguiente manera:

| Referencia del informe | Aplicación en el sistema |
|---|---|
| Sección 5.1 | Organización de los módulos según los departamentos del edificio |
| Sección 5.4 | Automatización del reabastecimiento mediante ventas, inventario y órdenes de compra |
| Sección 5.7 | Controles de seguridad, registro de acciones y trazabilidad mediante auditoría |

El sistema constituye un prototipo funcional de gestión empresarial que permite integrar procesos administrativos, controles de acceso y seguimiento de operaciones.

---

## 👨‍💻 Autores y contexto académico

**Proyecto:** Sistema de Reabastecimiento — ERP Modular  
**Institución:** Universidad Mariano Gálvez de Guatemala  
**Área académica:** Ingeniería en Sistemas  
**Curso:** Telecomunicaciones  
**Año:** 2026  

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos.

Si deseas publicarlo para su reutilización por terceros, agrega una licencia explícita, como MIT, después de confirmar que tienes autorización para distribuir el código y sus componentes.

---

## ⭐ Conclusión

El Sistema de Reabastecimiento — ERP Modular integra inventario, ventas, órdenes de compra, finanzas, recursos humanos y auditoría en una aplicación web con una API REST y una base de datos relacional.

Su objetivo es demostrar cómo la automatización de procesos y el control de acceso por roles pueden mejorar la gestión, el seguimiento y la trazabilidad de las operaciones de una organización.
