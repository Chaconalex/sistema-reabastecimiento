import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Megaphone,
  Users,
  ClipboardList,
  LogOut,
  Building2,
  Bell,
  Search,
  ShieldAlert,
} from "lucide-react";
import Login from "./Login";
import Dashboard from "./pages/Dashboard";
import Ventas from "./pages/Ventas";
import Auditoria from "./pages/Auditoria";
import RRHH from "./pages/RRHH";
import Finanzas from "./pages/Finanzas";
import Mercadeo from "./pages/Mercadeo";
import PerfilEmpleado from "./pages/PerfilEmpleado";

// Configuración de módulos del sistema
const modulos = [
  { path: "/", nombre: "Dashboard", icono: LayoutDashboard, roles: [] },
  { path: "/ventas", nombre: "Ventas e Inventario", icono: ShoppingCart, roles: ["compras", "gerencia"] },
  { path: "/finanzas", nombre: "Finanzas", icono: DollarSign, roles: ["gerencia"] },
  { path: "/mercadeo", nombre: "Mercadeo", icono: Megaphone, roles: ["gerencia"] },
  { path: "/rrhh", nombre: "Recursos Humanos", icono: Users, roles: ["gerencia"] },
  { path: "/auditoria", nombre: "Auditoría", icono: ClipboardList, roles: ["gerencia"] },
];

// Componente para restringir rutas (el administrador tiene bypass absoluto)
function RutaProtegida({ usuario, rolesPermitidos, children }) {
  const rolNormalizado = usuario?.rol?.toLowerCase().trim() || "";

  // Si es administrador, tiene acceso irrestricto
  if (rolNormalizado === "administrador" || rolNormalizado === "admin") {
    return children;
  }

  // Si no se restringe por roles, es ruta pública autenticada
  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return children;
  }

  const tienePermiso = rolesPermitidos.some(
    (r) => r.toLowerCase().trim() === rolNormalizado
  );

  if (!tienePermiso) {
    return (
      <div className="erp-error-container">
        <ShieldAlert size={48} style={{ color: "#ef4444" }} />
        <h2>Acceso Restringido</h2>
        <p>Tu rol ({usuario?.rol}) no cuenta con los permisos necesarios para acceder a esta área.</p>
      </div>
    );
  }

  return children;
}

function App() {
  const [usuario, setUsuario] = useState(() => {
    const sesionGuardada = localStorage.getItem("erp_usuario");
    return sesionGuardada ? JSON.parse(sesionGuardada) : null;
  });

  const location = useLocation();

  useEffect(() => {
    if (usuario) {
      localStorage.setItem("erp_usuario", JSON.stringify(usuario));
    } else {
      localStorage.removeItem("erp_usuario");
    }
  }, [usuario]);

  function cerrarSesion() {
    setUsuario(null);
  }

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  const rolUser = usuario.rol?.toLowerCase().trim() || "";
  const esAdmin = rolUser === "administrador" || rolUser === "admin";

  // El administrador ve todos los módulos; los demás roles ven solo lo permitido
  const modulosVisibles = modulos.filter((m) => {
    if (esAdmin) return true;
    if (!m.roles || m.roles.length === 0) return true;
    return m.roles.some((r) => r.toLowerCase().trim() === rolUser);
  });

  const moduloActual = modulos.find((m) => m.path === location.pathname)?.nombre || "Panel General";

  return (
    <div className="erp-container">
      {/* Sidebar de navegación */}
      <aside className="erp-sidebar">
        <div className="erp-brand">
          <div className="erp-logo-icon">
            <Building2 size={22} />
          </div>
          <div className="erp-brand-text">
            <h4>Soluciones Informáticas</h4>
            <span>ERP Enterprise</span>
          </div>
        </div>

        <nav className="erp-nav">
          <span className="erp-section-title">Navegación principal</span>
          <ul>
            {modulosVisibles.map((m) => {
              const Icono = m.icono;
              return (
                <li key={m.path}>
                  <NavLink
                    to={m.path}
                    end
                    className={({ isActive }) =>
                      `erp-nav-link ${isActive ? "erp-nav-link-activo" : ""}`
                    }
                  >
                    <Icono size={18} />
                    <span>{m.nombre}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Perfil del usuario autenticado */}
        <div className="erp-sidebar-footer">
          <div className="erp-user-badge">
            <div className="erp-avatar">
              {usuario.nombre ? usuario.nombre[0].toUpperCase() : "U"}
            </div>
            <div className="erp-user-details">
              <strong>{usuario.nombre}</strong>
              <small>{usuario.rol}</small>
            </div>
          </div>
          <button className="btn-logout" onClick={cerrarSesion} title="Cerrar sesión">
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <div className="erp-main-wrapper">
        <header className="erp-topbar">
          <div className="erp-breadcrumb">
            <span style={{ color: "#94a3b8" }}>Inicio</span> / <strong>{moduloActual}</strong>
          </div>
          <div className="erp-topbar-actions">
            <div className="erp-search-box">
              <Search size={16} />
              <input type="text" placeholder="Buscar registros..." />
            </div>
            <button className="erp-icon-btn" title="Notificaciones">
              <Bell size={18} />
              <span className="erp-badge-dot"></span>
            </button>
          </div>
        </header>

        <main className="erp-page-content">
          <Routes>
            <Route path="/" element={<Dashboard usuario={usuario} />} />
            <Route
              path="/ventas"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={["compras", "gerencia"]}>
                  <Ventas usuario={usuario} />
                </RutaProtegida>
              }
            />
            <Route
              path="/finanzas"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={["gerencia"]}>
                  <Finanzas usuario={usuario} />
                </RutaProtegida>
              }
            />
            <Route
              path="/mercadeo"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={["gerencia"]}>
                  <Mercadeo usuario={usuario} />
                </RutaProtegida>
              }
            />
            <Route
              path="/rrhh"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={["gerencia"]}>
                  <RRHH usuario={usuario} />
                </RutaProtegida>
              }
            />
            <Route
              path="/rrhh/:id"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={["gerencia"]}>
                  <PerfilEmpleado usuario={usuario} />
                </RutaProtegida>
              }
            />
            <Route
              path="/auditoria"
              element={
                <RutaProtegida usuario={usuario} rolesPermitidos={["gerencia"]}>
                  <Auditoria usuario={usuario} />
                </RutaProtegida>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;