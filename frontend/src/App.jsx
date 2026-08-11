import { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Login from "./Login";
import Ventas from "./pages/Ventas";
import Auditoria from "./pages/Auditoria";
import RRHH from "./pages/RRHH";
import Finanzas from "./pages/Finanzas";
import Mercadeo from "./pages/Mercadeo";

const modulos = [
  { path: "/ventas", nombre: "Ventas" },
  { path: "/finanzas", nombre: "Finanzas" },
  { path: "/mercadeo", nombre: "Mercadeo" },
  { path: "/rrhh", nombre: "Recursos Humanos" },
  { path: "/auditoria", nombre: "Auditoría" },
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: "220px",
          borderRight: "1px solid #ccc",
          padding: "20px",
        }}
      >
        <h3>Soluciones Informáticas</h3>
        <p style={{ fontSize: "14px", color: "#666" }}>
          {usuario.nombre} ({usuario.rol})
        </p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {modulos.map((m) => (
            <li key={m.path} style={{ marginBottom: "8px" }}>
              <NavLink
                to={m.path}
                style={({ isActive }) => ({
                  fontWeight: isActive ? "bold" : "normal",
                  textDecoration: "none",
                })}
              >
                {m.nombre}
              </NavLink>
            </li>
          ))}
        </ul>
        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </nav>

      <main style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="/ventas" element={<Ventas usuario={usuario} />} />
          <Route path="/finanzas" element={<Finanzas />} />
          <Route path="/mercadeo" element={<Mercadeo />} />
          <Route path="/rrhh" element={<RRHH usuario={usuario} />} />
          <Route path="/auditoria" element={<Auditoria usuario={usuario} />} />
          <Route path="*" element={<Ventas usuario={usuario} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;