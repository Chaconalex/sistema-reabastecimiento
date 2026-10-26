import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Package,
  ShoppingCart,
  History,
  Search,
  CheckCircle,
  Clock,
  PlusCircle,
  TrendingDown,
  RefreshCw,
} from "lucide-react";

function Ventas({ usuario }) {
  const [tabActiva, setTabActiva] = useState("inventario"); // 'inventario' | 'ordenes' | 'historial'
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [resumenVentas, setResumenVentas] = useState([]);
  const [procesandoId, setProcesandoId] = useState(null);

  const cargarDatos = async () => {
    try {
      const headers = { Authorization: `Bearer ${usuario.token}` };
      const [resProd, resOrd, resHist, resRes] = await Promise.all([
        fetch("http://localhost:3000/productos").then((r) => r.json()),
        fetch("http://localhost:3000/ordenes").then((r) => r.json()),
        fetch("http://localhost:3000/ventas/historial", { headers }).then((r) => r.json()),
        fetch("http://localhost:3000/ventas/resumen", { headers }).then((r) => r.json()),
      ]);

      setProductos(resProd || []);
      setOrdenes(resOrd || []);
      setHistorial(resHist || []);
      setResumenVentas(resRes || []);
    } catch (err) {
      console.error("Error al sincronizar datos:", err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [usuario]);

  async function venderProducto(id) {
    try {
      setProcesandoId(id);
      await fetch(`http://localhost:3000/productos/${id}/vender`, {
        method: "POST",
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      await cargarDatos();
    } finally {
      setProcesandoId(null);
    }
  }

  async function recibirOrden(id) {
    try {
      setProcesandoId(id);
      await fetch(`http://localhost:3000/ordenes/${id}/recibir`, {
        method: "POST",
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      await cargarDatos();
    } finally {
      setProcesandoId(null);
    }
  }

  // Filtrado reactivo de inventario
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) =>
      p.Nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [productos, busqueda]);

  return (
    <div className="modulo-ventas">
      {/* Encabezado */}
      <div className="modulo-header">
        <div>
          <h2>Gestión de Ventas y Reabastecimiento</h2>
          <p className="subtitulo">
            Control de inventario de almacén, órdenes de reorden automáticas y rotación.
          </p>
        </div>
        <button className="btn btn-outline" onClick={cargarDatos} title="Refrescar">
          <RefreshCw size={16} /> Refrescar
        </button>
      </div>

      {/* Gráfico Analítico de Demanda */}
      {resumenVentas.length > 0 && (
        <div className="erp-card mb-4">
          <div className="card-header">
            <h3>Demanda y Rotación de Productos</h3>
            <small>Unidades despachadas históricamente</small>
          </div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={resumenVentas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="Producto" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                  itemStyle={{ color: "#38bdf8" }}
                />
                <Bar dataKey="UnidadesVendidas" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Selector de Pestañas */}
      <div className="erp-tabs-bar">
        <button
          className={`tab-btn ${tabActiva === "inventario" ? "active" : ""}`}
          onClick={() => setTabActiva("inventario")}
        >
          <Package size={16} /> Catálogo e Inventario ({productos.length})
        </button>
        <button
          className={`tab-btn ${tabActiva === "ordenes" ? "active" : ""}`}
          onClick={() => setTabActiva("ordenes")}
        >
          <ShoppingCart size={16} /> Órdenes de Reabastecimiento (
          {ordenes.filter((o) => o.Estado !== "recibida").length})
        </button>
        <button
          className={`tab-btn ${tabActiva === "historial" ? "active" : ""}`}
          onClick={() => setTabActiva("historial")}
        >
          <History size={16} /> Historial de Salidas ({historial.length})
        </button>
      </div>

      {/* PESTAÑA 1: INVENTARIO */}
      {tabActiva === "inventario" && (
        <div className="erp-card">
          <div className="table-controls">
            <div className="erp-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por nombre de producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock Físico</th>
                  <th>Punto de Reorden</th>
                  <th>Estado de Disponibilidad</th>
                  <th style={{ textAlign: "right" }}>Operación</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p) => {
                  const bajoStock = p.Stock <= p.PuntoReorden;
                  return (
                    <tr key={p.Id}>
                      <td className="font-semibold">{p.Nombre}</td>
                      <td>
                        <span className="stock-number">{p.Stock} uds.</span>
                      </td>
                      <td>
                        <span className="text-muted">{p.PuntoReorden} uds.</span>
                      </td>
                      <td>
                        {bajoStock ? (
                          <span className="badge badge-peligro">
                            <TrendingDown size={12} /> Stock Crítico
                          </span>
                        ) : (
                          <span className="badge badge-exito">
                            <CheckCircle size={12} /> Nivel Óptimo
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={p.Stock <= 0 || procesandoId === p.Id}
                          onClick={() => venderProducto(p.Id)}
                        >
                          <PlusCircle size={14} /> Registrar Venta
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ÓRDENES DE COMPRA */}
      {tabActiva === "ordenes" && (
        <div className="erp-card">
          {ordenes.length === 0 ? (
            <p className="text-muted text-center py-4">No hay órdenes registradas.</p>
          ) : (
            <div className="erp-table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>ID Orden</th>
                    <th>Producto Solicitado</th>
                    <th>Cantidad Lote</th>
                    <th>Estado de Envío</th>
                    <th style={{ textAlign: "right" }}>Acción de Recepción</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((o) => {
                    const esRecibida = o.Estado === "recibida";
                    return (
                      <tr key={o.Id}>
                        <td>#{o.Id}</td>
                        <td className="font-semibold">{o.Producto}</td>
                        <td>{o.Cantidad} unidades</td>
                        <td>
                          <span className={`badge ${esRecibida ? "badge-exito" : "badge-alerta"}`}>
                            {esRecibida ? <CheckCircle size={12} /> : <Clock size={12} />}
                            {o.Estado}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {!esRecibida ? (
                            <button
                              className="btn btn-success btn-sm"
                              disabled={procesandoId === o.Id}
                              onClick={() => recibirOrden(o.Id)}
                            >
                              Ingresar a Stock
                            </button>
                          ) : (
                            <span className="text-muted text-sm">Completada</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: HISTORIAL */}
      {tabActiva === "historial" && (
        <div className="erp-card">
          {historial.length === 0 ? (
            <p className="text-muted text-center py-4">Aún no se han generado salidas.</p>
          ) : (
            <div className="erp-table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Fecha de Emisión</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Vendedor / Emisor</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.Id}>
                      <td className="text-muted">{h.CreadoEn}</td>
                      <td className="font-semibold">{h.Producto}</td>
                      <td>
                        <span className="badge badge-neutral">{h.Cantidad} uds.</span>
                      </td>
                      <td>{h.Vendedor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Ventas;