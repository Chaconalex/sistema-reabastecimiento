import { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Login from "./Login";
import Ventas from "./pages/Ventas";
import Auditoria from "./pages/Auditoria";
import RRHH from "./pages/RRHH";
import Finanzas from "./pages/Finanzas";
import Mercadeo from "./pages/Mercadeo";
import { ShoppingCart, DollarSign, Megaphone, Users, ClipboardList, LogOut } from "lucide-react";

const modulos = [
  { path: "/ventas", nombre: "Ventas", icono: ShoppingCart },
  { path: "/finanzas", nombre: "Finanzas", icono: DollarSign },
  { path: "/mercadeo", nombre: "Mercadeo", icono: Megaphone },
  { path: "/rrhh", nombre: "Recursos Humanos", icono: Users },
  { path: "/auditoria", nombre: "Auditoría", icono: ClipboardList },
];
function App() {
  const [usuario, setUsuario] = useState(null);

  function cerrarSesion() {
    setUsuario(null);
  }

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  return (
    <div className="layout">
      <nav className="sidebar">
        <h3>Soluciones Informáticas</h3>
        <p className="usuario-info">
          {usuario.nombre} · {usuario.rol}
        </p>
        <ul>
          {modulos.map((m) => {
            const Icono = m.icono;
            return (
              <li key={m.path}>
                <NavLink
                  to={m.path}
                  className={({ isActive }) => (isActive ? "activo" : "")}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Icono size={18} />
                  {m.nombre}
                </NavLink>
              </li>
            );
          })}
        </ul>
        <button className="btn btn-secundario" onClick={cerrarSesion} style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
  <LogOut size={16} /> Cerrar sesión
</button>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/ventas" element={<Ventas usuario={usuario} />} />
          <Route path="/finanzas" element={<Finanzas usuario={usuario} />} />
          <Route path="/mercadeo" element={<Mercadeo usuario={usuario} />} />
          <Route path="/rrhh" element={<RRHH usuario={usuario} />} />
          <Route path="/auditoria" element={<Auditoria usuario={usuario} />} />
          <Route path="*" element={<Ventas usuario={usuario} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;