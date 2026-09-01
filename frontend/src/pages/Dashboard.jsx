import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Users,
  Megaphone,
  ClipboardList,
} from "lucide-react";

function Dashboard({ usuario }) {
  const [resumen, setResumen] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/dashboard/resumen", {
      headers: { Authorization: `Bearer ${usuario.token}` },
    })
      .then((res) => res.json())
      .then((data) => setResumen(data));
  }, [usuario]);

  if (!resumen) return <p>Cargando...</p>;

  const tarjetas = [
    { icono: AlertTriangle, valor: resumen.productosBajoStock, etiqueta: "Productos en bajo stock" },
    { icono: ShoppingCart, valor: resumen.ordenesPendientes, etiqueta: "Órdenes pendientes de recibir" },
    { icono: DollarSign, valor: `Q ${resumen.gastoTotal.toFixed(2)}`, etiqueta: "Gasto total en órdenes" },
    { icono: Users, valor: resumen.totalEmpleados, etiqueta: "Empleados en el sistema" },
    { icono: Megaphone, valor: resumen.promocionesActivas, etiqueta: "Promociones activas" },
  ];

  const accesos = [
    { path: "/ventas", nombre: "Registrar venta", icono: ShoppingCart },
    { path: "/mercadeo", nombre: "Gestionar promociones", icono: Megaphone },
    { path: "/rrhh", nombre: "Ver empleados", icono: Users },
    { path: "/auditoria", nombre: "Ver bitácora", icono: ClipboardList },
  ];

  return (
    <div>
      <h1>Bienvenido, {usuario.nombre}</h1>
      <p style={{ color: "var(--texto-secundario)" }}>
        Resumen general de Soluciones Informáticas
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          margin: "20px 0",
        }}
      >
        {tarjetas.map((t, i) => {
          const Icono = t.icono;
          return (
            <div className="card" key={i}>
              <Icono size={22} color="var(--azul-primario)" />
              <p className="stat-numero">{t.valor}</p>
              <p className="stat-label">{t.etiqueta}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Accesos rápidos</h3>
          {accesos.map((a) => {
            const Icono = a.icono;
            return (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className="btn btn-secundario"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  marginBottom: "8px",
                  justifyContent: "flex-start",
                }}
              >
                <Icono size={16} /> {a.nombre}
              </button>
            );
          })}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Actividad reciente</h3>
          {resumen.actividadReciente.length === 0 && <p>Sin actividad todavía.</p>}
          {resumen.actividadReciente.map((a, i) => (
            <div
              key={i}
              style={{
                borderBottom: i < resumen.actividadReciente.length - 1 ? "1px solid var(--gris-borde)" : "none",
                padding: "8px 0",
                fontSize: "13px",
              }}
            >
              <strong>{a.Usuario}</strong> — {a.Detalle}
              <div style={{ color: "var(--texto-secundario)", fontSize: "12px" }}>
                {a.CreadoEn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;