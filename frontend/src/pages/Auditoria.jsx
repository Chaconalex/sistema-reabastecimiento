import { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  Search,
  Download,
  Filter,
  ShieldAlert,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

function Auditoria({ usuario }) {
  const [registros, setRegistros] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("TODAS");
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 10;

  function cargarAuditoria() {
    setCargando(true);
    setError("");
    fetch("http://localhost:3000/auditoria", {
      headers: { Authorization: `Bearer ${usuario?.token}` },
    })
      .then((res) => {
        if (res.status === 403) {
          setError("No tienes los privilegios necesarios para consultar la bitácora de auditoría.");
          return [];
        }
        if (!res.ok) throw new Error("Error en el servidor");
        return res.json();
      })
      .then((data) => setRegistros(data || []))
      .catch(() => {
        if (!error) setError("Error al sincronizar la bitácora del sistema.");
      })
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    if (usuario?.token) {
      cargarAuditoria();
    }
  }, [usuario]);

  const tiposDeAccion = useMemo(() => {
    const acciones = registros.map((r) => r.Accion).filter(Boolean);
    return ["TODAS", ...Array.from(new Set(acciones))];
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      const matchBusqueda =
        r.Usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.Detalle?.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.Accion?.toLowerCase().includes(busqueda.toLowerCase());

      const matchAccion =
        filtroAccion === "TODAS" || r.Accion?.toUpperCase() === filtroAccion.toUpperCase();

      return matchBusqueda && matchAccion;
    });
  }, [registros, busqueda, filtroAccion]);

  const totalPaginas = Math.ceil(registrosFiltrados.length / filasPorPagina) || 1;
  const registrosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPagina;
    return registrosFiltrados.slice(inicio, inicio + filasPorPagina);
  }, [registrosFiltrados, paginaActual]);

  function exportarCSV() {
    if (registrosFiltrados.length === 0) return;

    const encabezados = ["ID", "Fecha", "Usuario", "Accion", "Detalle"];
    const lineas = registrosFiltrados.map((r) => [
      `"${r.Id || ""}"`,
      `"${r.CreadoEn || ""}"`,
      `"${r.Usuario || ""}"`,
      `"${r.Accion || ""}"`,
      `"${(r.Detalle || "").replace(/"/g, '""')}"`,
    ]);

    const contenidoCSV = [encabezados.join(","), ...lineas.map((l) => l.join(","))].join("\n");
    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getBadgeClass(accion) {
    const act = (accion || "").toUpperCase();
    if (act.includes("VENTA") || act.includes("EXITO") || act.includes("RECIBIR")) return "badge-exito";
    if (act.includes("ELIMINAR") || act.includes("DELETE") || act.includes("ERROR")) return "badge-peligro";
    if (act.includes("ORDEN") || act.includes("ALERTA") || act.includes("EDITAR")) return "badge-alerta";
    return "badge-neutral";
  }

  if (error) {
    return (
      <div className="erp-error-container">
        <ShieldAlert size={48} style={{ color: "#ef4444" }} />
        <h2>Acceso Denegado</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="modulo-auditoria">
      <div className="modulo-header">
        <div>
          <h2>Bitácora de Auditoría del Sistema</h2>
          <p className="subtitulo">
            Trazabilidad de operaciones, cambios en inventario y accesos.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-outline" onClick={cargarAuditoria} title="Refrescar bitácora">
            <RefreshCw size={15} /> Actualizar
          </button>
          <button
            className="btn btn-primary"
            onClick={exportarCSV}
            disabled={registrosFiltrados.length === 0}
          >
            <Download size={15} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="erp-card mb-4">
        <div className="auditoria-toolbar">
          <div className="erp-search-box" style={{ flex: 1 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por usuario, detalle o acción..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>

          <div className="auditoria-filtro-select">
            <Filter size={16} className="text-muted" />
            <select
              value={filtroAccion}
              onChange={(e) => {
                setFiltroAccion(e.target.value);
                setPaginaActual(1);
              }}
            >
              {tiposDeAccion.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo === "TODAS" ? "Todas las acciones" : tipo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="erp-table-responsive" style={{ marginTop: "16px" }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: "180px" }}>
                  <span className="th-with-icon"><Calendar size={14} /> Fecha y Hora</span>
                </th>
                <th style={{ width: "160px" }}>
                  <span className="th-with-icon"><User size={14} /> Usuario</span>
                </th>
                <th style={{ width: "160px" }}>Acción Realizada</th>
                <th>Detalle Operativo</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    Sincronizando bitácora...
                  </td>
                </tr>
              ) : registrosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                registrosPaginados.map((r) => (
                  <tr key={r.Id}>
                    <td className="text-muted text-sm font-mono">{r.CreadoEn}</td>
                    <td className="font-semibold text-light">{r.Usuario}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(r.Accion)}`}>
                        {r.Accion}
                      </span>
                    </td>
                    <td className="text-detail">{r.Detalle}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="auditoria-pagination-footer">
          <small className="text-muted">
            Mostrando {registrosPaginados.length} de {registrosFiltrados.length} eventos registrados
          </small>
          <div className="pagination-controls">
            <button
              className="btn btn-outline btn-sm"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="pagination-page-indicator">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={paginaActual >= totalPaginas}
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auditoria;