import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Activity,
  AlertCircle,
  Loader2,
} from "lucide-react";

function PerfilEmpleado({ usuario }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const esAdmin =
    usuario?.rol?.toLowerCase().trim() === "administrador" ||
    usuario?.rol?.toLowerCase().trim() === "admin";

  function cargar() {
    setCargando(true);
    setError("");
    fetch(`http://localhost:3000/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${usuario?.token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener la información del colaborador");
        return res.json();
      })
      .then((data) => setEmpleado(data))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, [id]);

  async function cambiarEstado() {
    try {
      setProcesando(true);
      const res = await fetch(`http://localhost:3000/usuarios/${id}/estado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario?.token}`,
        },
        body: JSON.stringify({ activo: !empleado.Activo }),
      });

      if (!res.ok) throw new Error("Error al actualizar el estado del colaborador");
      await cargar();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) {
    return (
      <div className="erp-loading-skeleton" style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div className="skeleton-title" style={{ width: "220px" }}></div>
        <div className="skeleton-card" style={{ height: "240px", marginTop: "16px" }}></div>
        <div className="skeleton-card" style={{ height: "200px", marginTop: "20px" }}></div>
      </div>
    );
  }

  if (error || !empleado) {
    return (
      <div className="erp-error-container">
        <AlertCircle size={48} style={{ color: "#ef4444" }} />
        <h2>Colaborador no disponible</h2>
        <p>{error || "No se encontró el registro del empleado en la base de datos."}</p>
        <button className="btn btn-outline" onClick={() => navigate("/rrhh")}>
          <ArrowLeft size={16} /> Volver a Recursos Humanos
        </button>
      </div>
    );
  }

  const iniciales = empleado.Nombre
    ? empleado.Nombre.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EM";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Botón de retorno */}
      <div style={{ marginBottom: "18px" }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate("/rrhh")}>
          <ArrowLeft size={15} /> Regresar al directorio
        </button>
      </div>

      {/* Ficha Principal del Colaborador */}
      <div className="erp-card mb-4">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            borderBottom: "1px solid #334155",
            paddingBottom: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              {iniciales}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#f8fafc" }}>
                  {empleado.Nombre}
                </h2>
                <span className={`badge ${empleado.Activo ? "badge-exito" : "badge-peligro"}`}>
                  {empleado.Activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "3px" }}>
                {empleado.Departamento || "Sin Departamento"} · Rol: <strong style={{ textTransform: "capitalize", color: "#cbd5e1" }}>{empleado.Rol}</strong>
              </p>
            </div>
          </div>

          {/* Acción Administrativa */}
          {esAdmin && (
            <div>
              {empleado.Activo ? (
                <button
                  className="btn"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                  }}
                  disabled={procesando}
                  onClick={cambiarEstado}
                >
                  {procesando ? (
                    <Loader2 size={16} className="spin-icon" />
                  ) : (
                    <UserX size={16} />
                  )}
                  Desactivar cuenta
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  disabled={procesando}
                  onClick={cambiarEstado}
                >
                  {procesando ? (
                    <Loader2 size={16} className="spin-icon" />
                  ) : (
                    <UserCheck size={16} />
                  )}
                  Activar cuenta
                </button>
              )}
            </div>
          )}
        </div>

        {/* Ficha técnica en cuadrícula */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          <div className="perfil-item-box">
            <span className="text-muted" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", marginBottom: "4px" }}>
              <Mail size={14} /> Correo Electrónico
            </span>
            <strong style={{ color: "#f8fafc", fontSize: "0.9rem" }}>{empleado.Correo}</strong>
          </div>

          <div className="perfil-item-box">
            <span className="text-muted" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", marginBottom: "4px" }}>
              <Phone size={14} /> Teléfono Directo
            </span>
            <strong style={{ color: "#f8fafc", fontSize: "0.9rem" }}>{empleado.Telefono || "No registrado"}</strong>
          </div>

          <div className="perfil-item-box">
            <span className="text-muted" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", marginBottom: "4px" }}>
              <Building size={14} /> Departamento
            </span>
            <strong style={{ color: "#f8fafc", fontSize: "0.9rem" }}>{empleado.Departamento || "No asignado"}</strong>
          </div>

          <div className="perfil-item-box">
            <span className="text-muted" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", marginBottom: "4px" }}>
              <Calendar size={14} /> Fecha de Contratación
            </span>
            <strong style={{ color: "#f8fafc", fontSize: "0.9rem" }}>
              {empleado.FechaContratacion ? empleado.FechaContratacion.slice(0, 10) : "No registrada"}
            </strong>
          </div>
        </div>
      </div>

      {/* Bitácora de Actividad del Colaborador */}
      <div className="erp-card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={18} style={{ color: "#3b82f6" }} />
            <h3 style={{ margin: 0 }}>Actividad Registrada en el Sistema</h3>
          </div>
          <small className="text-muted">
            {empleado.actividad ? empleado.actividad.length : 0} movimientos
          </small>
        </div>

        {(!empleado.actividad || empleado.actividad.length === 0) ? (
          <p className="text-muted text-center py-4">Este usuario aún no registra acciones en la bitácora.</p>
        ) : (
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: "170px" }}>
                    <span className="th-with-icon"><Clock size={13} /> Fecha</span>
                  </th>
                  <th style={{ width: "140px" }}>Acción</th>
                  <th>Detalle Operativo</th>
                </tr>
              </thead>
              <tbody>
                {empleado.actividad.map((a, i) => (
                  <tr key={i}>
                    <td className="text-muted text-sm font-mono">{a.CreadoEn}</td>
                    <td>
                      <span className="badge badge-exito">{a.Accion}</span>
                    </td>
                    <td className="text-detail">{a.Detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerfilEmpleado;