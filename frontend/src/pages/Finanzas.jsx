import { useState, useEffect, useMemo } from "react";
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
  CartesianGrid,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  ShieldAlert,
  Download,
  RefreshCw,
  PieChart as PieIcon,
  Calendar,
} from "lucide-react";

// Paleta moderna para métricas financieras
const COLORES = [
  "#3b82f6", // Azul primario
  "#10b981", // Esmeralda
  "#8b5cf6", // Violeta
  "#f59e0b", // Ámbar
  "#06b6d4", // Cian
  "#ec4899", // Rosa
  "#64748b", // Slate
];

function Finanzas({ usuario }) {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  function cargarFinanzas() {
    setCargando(true);
    setError("");
    fetch("http://localhost:3000/finanzas/resumen", {
      headers: { Authorization: `Bearer ${usuario?.token}` },
    })
      .then((res) => {
        if (res.status === 403) {
          setError("No tienes los privilegios necesarios para consultar las métricas financieras.");
          return null;
        }
        if (!res.ok) throw new Error("Error al obtener datos financieros");
        return res.json();
      })
      .then((data) => {
        if (data) setResumen(data);
      })
      .catch((err) => {
        if (!error) setError(err.message || "Error al conectar con el servidor.");
      })
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarFinanzas();
  }, [usuario]);

  // Cálculos derivados
  const { totalUnidades, ticketPromedio } = useMemo(() => {
    if (!resumen || !resumen.porProducto) return { totalUnidades: 0, ticketPromedio: 0 };
    const unidades = resumen.porProducto.reduce((acc, p) => acc + (p.UnidadesOrdenadas || 0), 0);
    const prom = resumen.porProducto.length > 0 ? (resumen.gastoTotal || 0) / resumen.porProducto.length : 0;
    return { totalUnidades: unidades, ticketPromedio: prom };
  }, [resumen]);

  // Exportar reporte de finanzas a CSV
  function exportarReporte() {
    if (!resumen || !resumen.porProducto || resumen.porProducto.length === 0) return;

    const encabezados = ["Producto", "Unidades Ordenadas", "Gasto Total (Q)", "% Participacion"];
    const totalGasto = resumen.gastoTotal || 1;
    const filas = resumen.porProducto.map((p) => {
      const participacion = ((p.Gasto / totalGasto) * 100).toFixed(2);
      return [
        `"${p.Producto}"`,
        p.UnidadesOrdenadas,
        p.Gasto.toFixed(2),
        `"${participacion}%"`,
      ];
    });

    const contenido = [encabezados.join(","), ...filas.map((f) => f.join(","))].join("\n");
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte_finanzas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (error) {
    return (
      <div className="erp-error-container">
        <ShieldAlert size={48} style={{ color: "#ef4444" }} />
        <h2>Acceso Restringido</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="erp-loading-skeleton">
        <div className="skeleton-title" style={{ width: "240px" }}></div>
        <div className="skeleton-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
        <div className="dashboard-main-grid" style={{ marginTop: "24px" }}>
          <div className="skeleton-card" style={{ height: "260px" }}></div>
          <div className="skeleton-card" style={{ height: "260px" }}></div>
        </div>
      </div>
    );
  }

  if (!resumen) return null;

  return (
    <div className="modulo-finanzas">
      {/* Encabezado */}
      <div className="modulo-header">
        <div>
          <h2>Control Financiero de Reabastecimiento</h2>
          <p className="subtitulo">
            Análisis de egresos, rotación de compras y presupuesto invertido en inventario.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-outline" onClick={cargarFinanzas} title="Refrescar datos">
            <RefreshCw size={15} /> Actualizar
          </button>
          <button className="btn btn-primary" onClick={exportarReporte}>
            <Download size={15} /> Exportar Reporte
          </button>
        </div>
      </div>

      {/* Métricas / KPIs Superiores */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-primario">
          <div className="kpi-top">
            <span>Inversión en Reabastecimiento</span>
            <DollarSign size={18} />
          </div>
          <div className="kpi-valor">
            Q {Number(resumen.gastoTotal || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtexto">Gasto acumulado en órdenes de compra</div>
        </div>

        <div className="kpi-card kpi-info">
          <div className="kpi-top">
            <span>Volumen Reabastecido</span>
            <Package size={18} />
          </div>
          <div className="kpi-valor">{totalUnidades.toLocaleString()} uds.</div>
          <div className="kpi-subtexto">Unidades gestionadas por el sistema</div>
        </div>

        <div className="kpi-card kpi-secundario">
          <div className="kpi-top">
            <span>Costo Promedio por Línea</span>
            <TrendingUp size={18} />
          </div>
          <div className="kpi-valor">
            Q {ticketPromedio.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtexto">Inversión promedio por producto</div>
        </div>
      </div>

      {/* Gráficos Analíticos */}
      <div className="dashboard-main-grid mb-4">
        {/* Línea de tendencia mensual */}
        <div className="erp-card">
          <div className="card-header">
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Curva de Gasto Mensual</h3>
              <small className="text-muted">Evolución de egresos a lo largo del tiempo</small>
            </div>
            <Calendar size={18} style={{ color: "#3b82f6" }} />
          </div>

          {(!resumen.porMes || resumen.porMes.length === 0) ? (
            <p className="text-muted text-center py-5">Sin suficientes registros históricos mensuales.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={resumen.porMes} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="Mes" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => `Q ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#475569",
                      borderRadius: "8px",
                      color: "#f8fafc",
                    }}
                    formatter={(val) => [`Q ${Number(val).toFixed(2)}`, "Inversión"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="Gasto"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6, fill: "#60a5fa" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Distribución porcentual por producto */}
        <div className="erp-card">
          <div className="card-header">
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Distribución del Presupuesto</h3>
              <small className="text-muted">Participación por producto ordenado</small>
            </div>
            <PieIcon size={18} style={{ color: "#10b981" }} />
          </div>

          {(!resumen.porProducto || resumen.porProducto.length === 0) ? (
            <p className="text-muted text-center py-5">No hay órdenes registradas para desglosar.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={resumen.porProducto}
                    dataKey="Gasto"
                    nameKey="Producto"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {resumen.porProducto.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#475569",
                      borderRadius: "8px",
                      color: "#f8fafc",
                    }}
                    formatter={(val) => [`Q ${Number(val).toFixed(2)}`, "Gasto"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Tabla Desglose Detallado */}
      <div className="erp-card">
        <div className="card-header">
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Detalle de Egresos por Artículo</h3>
            <small className="text-muted">Desglose de compras consolidadas</small>
          </div>
          <span className="badge badge-neutral">
            {resumen.porProducto?.length || 0} artículos con demanda
          </span>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Línea / Producto</th>
                <th>Unidades Suministradas</th>
                <th>Inversión Acumulada</th>
                <th style={{ width: "220px" }}>Participación en Presupuesto</th>
              </tr>
            </thead>
            <tbody>
              {(!resumen.porProducto || resumen.porProducto.length === 0) ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    No se registran compras activas.
                  </td>
                </tr>
              ) : (
                resumen.porProducto.map((p, idx) => {
                  const total = resumen.gastoTotal || 1;
                  const porcentaje = ((p.Gasto / total) * 100).toFixed(1);

                  return (
                    <tr key={p.Producto || idx}>
                      <td className="font-semibold text-light">{p.Producto}</td>
                      <td>
                        <span className="badge badge-neutral">{p.UnidadesOrdenadas} uds.</span>
                      </td>
                      <td className="font-semibold" style={{ color: "#38bdf8" }}>
                        Q {Number(p.Gasto).toFixed(2)}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              flex: 1,
                              height: "6px",
                              backgroundColor: "#334155",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${porcentaje}%`,
                                height: "100%",
                                backgroundColor: COLORES[idx % COLORES.length],
                                borderRadius: "4px",
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8", minWidth: "40px" }}>
                            {porcentaje}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Finanzas;