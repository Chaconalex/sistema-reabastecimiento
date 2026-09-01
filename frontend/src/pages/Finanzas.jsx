import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORES = ["#1e3a5f", "#2d5a8c", "#5b8bb8", "#8fb3d3", "#c2d9ec"];

function Finanzas({ usuario }) {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/finanzas/resumen", {
      headers: { Authorization: `Bearer ${usuario.token}` },
    })
      .then((res) => {
        if (res.status === 403) {
          setError("No tienes permiso para ver finanzas.");
          return null;
        }
        return res.json();
      })
      .then((data) => setResumen(data));
  }, [usuario]);

  if (error) return <p style={{ color: "var(--rojo-alerta)" }}>{error}</p>;
  if (!resumen) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Finanzas — Gasto en reabastecimiento</h1>

      <div className="card">
        <p className="stat-numero">Q {resumen.gastoTotal.toFixed(2)}</p>
        <p className="stat-label">Gasto total generado por órdenes de compra</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Gasto por mes</h3>
          {resumen.porMes.length === 0 ? (
            <p>Sin datos suficientes todavía.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={resumen.porMes}>
                <XAxis dataKey="Mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="Gasto" stroke="#1e3a5f" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Gasto por producto</h3>
          {resumen.porProducto.length === 0 ? (
            <p>Sin datos suficientes todavía.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={resumen.porProducto}
                  dataKey="Gasto"
                  nameKey="Producto"
                  outerRadius={80}
                  label
                >
                  {resumen.porProducto.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <h2>Detalle por producto</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidades ordenadas</th>
              <th>Gasto</th>
            </tr>
          </thead>
          <tbody>
            {resumen.porProducto.map((p) => (
              <tr key={p.Producto}>
                <td>{p.Producto}</td>
                <td>{p.UnidadesOrdenadas}</td>
                <td>Q {p.Gasto.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Finanzas;