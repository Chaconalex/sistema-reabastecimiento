import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Building,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Mail,
  Briefcase,
  UserPlus,
  Edit2,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";

const DEPARTAMENTOS_DISPONIBLES = [
  "Informática",
  "Ventas",
  "Finanzas",
  "Mercadeo",
  "Auditoría",
  "Gerencia",
];

const ROLES_DISPONIBLES = ["administrador", "compras", "gerencia"];

function RRHH({ usuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [deptoFiltro, setDeptoFiltro] = useState("TODOS");

  // Estados para modal de alta / edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "compras",
    departamento: "Ventas",
    telefono: "",
  });

  const navigate = useNavigate();
  const esAdmin =
    usuario?.rol?.toLowerCase().trim() === "administrador" ||
    usuario?.rol?.toLowerCase().trim() === "admin";

  function cargarUsuarios() {
    setCargando(true);
    fetch("http://localhost:3000/usuarios", {
      headers: { Authorization: `Bearer ${usuario?.token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error en la solicitud");
        return res.json();
      })
      .then((data) => setUsuarios(data || []))
      .catch((err) => console.error(err))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarUsuarios();
  }, [usuario]);

  // Lista de departamentos para el dropdown
  const departamentos = useMemo(() => {
    const dptos = usuarios.map((u) => u.Departamento).filter(Boolean);
    return ["TODOS", ...Array.from(new Set(dptos))];
  }, [usuarios]);

  // Filtro reactivo en memoria
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchTexto =
        u.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.Correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.Rol?.toLowerCase().includes(busqueda.toLowerCase());

      const matchDepto =
        deptoFiltro === "TODOS" || u.Departamento === deptoFiltro;

      return matchTexto && matchDepto;
    });
  }, [usuarios, busqueda, deptoFiltro]);

  // KPIs
  const totalActivos = usuarios.filter((u) => Boolean(u.Activo)).length;
  const totalInactivos = usuarios.length - totalActivos;
  const totalDeptos = new Set(usuarios.map((u) => u.Departamento).filter(Boolean)).size;

  // Funciones de control del modal
  function abrirModalNuevo() {
    setModoEdicion(false);
    setIdSeleccionado(null);
    setFormData({
      nombre: "",
      correo: "",
      contrasena: "",
      rol: "compras",
      departamento: "Ventas",
      telefono: "",
    });
    setErrorModal("");
    setModalAbierto(true);
  }

  function abrirModalEditar(u, e) {
    e.stopPropagation();
    setModoEdicion(true);
    setIdSeleccionado(u.Id);
    setFormData({
      nombre: u.Nombre || "",
      correo: u.Correo || "",
      contrasena: "", // Se mantiene vacío si no se desea cambiar
      rol: u.Rol || "compras",
      departamento: u.Departamento || "Ventas",
      telefono: u.Telefono || "",
    });
    setErrorModal("");
    setModalAbierto(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setErrorModal("");

    const url = modoEdicion
      ? `http://localhost:3000/usuarios/${idSeleccionado}`
      : "http://localhost:3000/usuarios";

    const method = modoEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario?.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al procesar los datos");
      }

      setModalAbierto(false);
      cargarUsuarios();
    } catch (err) {
      setErrorModal(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="modulo-rrhh">
      {/* Cabecera */}
      <div className="modulo-header">
        <div>
          <h2>Recursos Humanos — Nómina y Colaboradores</h2>
          <p className="subtitulo">
            Directorio corporativo, control de estado laboral y expedientes de usuario.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-outline" onClick={cargarUsuarios} title="Refrescar datos">
            <RefreshCw size={15} /> Actualizar
          </button>
          {esAdmin && (
            <button className="btn btn-primary" onClick={abrirModalNuevo}>
              <UserPlus size={16} /> Nuevo Colaborador
            </button>
          )}
        </div>
      </div>

      {/* Grid de KPIs de RRHH */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-primario">
          <div className="kpi-top">
            <span className="kpi-titulo">Total Colaboradores</span>
            <Users size={18} />
          </div>
          <div className="kpi-valor">{usuarios.length}</div>
          <div className="kpi-subtexto">Plantilla total registrada</div>
        </div>

        <div className="kpi-card kpi-exito">
          <div className="kpi-top">
            <span className="kpi-titulo">Personal Activo</span>
            <UserCheck size={18} />
          </div>
          <div className="kpi-valor">{totalActivos}</div>
          <div className="kpi-subtexto">Con acceso al sistema</div>
        </div>

        <div className="kpi-card kpi-peligro">
          <div className="kpi-top">
            <span className="kpi-titulo">Inactivos / Bajas</span>
            <UserX size={18} />
          </div>
          <div className="kpi-valor">{totalInactivos}</div>
          <div className="kpi-subtexto">Accesos revocados</div>
        </div>

        <div className="kpi-card kpi-info">
          <div className="kpi-top">
            <span className="kpi-titulo">Departamentos</span>
            <Building size={18} />
          </div>
          <div className="kpi-valor">{totalDeptos}</div>
          <div className="kpi-subtexto">Áreas funcionales</div>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="erp-card">
        <div className="auditoria-toolbar">
          <div className="erp-search-box" style={{ flex: 1 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por colaborador, correo o rol..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="auditoria-filtro-select">
            <Filter size={16} className="text-muted" />
            <select
              value={deptoFiltro}
              onChange={(e) => setDeptoFiltro(e.target.value)}
            >
              {departamentos.map((d) => (
                <option key={d} value={d}>
                  {d === "TODOS" ? "Todos los departamentos" : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla Directorio */}
        <div className="erp-table-responsive" style={{ marginTop: "16px" }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Rol / Permiso</th>
                <th>Departamento</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Cargando nómina de colaboradores...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No se encontraron colaboradores que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const estaActivo = Boolean(u.Activo);
                  const iniciales = u.Nombre
                    ? u.Nombre.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "U";

                  return (
                    <tr
                      key={u.Id}
                      className="tabla-fila-clickeable"
                      onClick={() => navigate(`/rrhh/${u.Id}`)}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: "#334155",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              color: "#f8fafc",
                            }}
                          >
                            {iniciales}
                          </div>
                          <div>
                            <strong style={{ display: "block", color: "#f8fafc", fontSize: "0.9rem" }}>
                              {u.Nombre}
                            </strong>
                            <span style={{ color: "#94a3b8", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Mail size={12} /> {u.Correo}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-neutral font-mono" style={{ textTransform: "capitalize" }}>
                          {u.Rol}
                        </span>
                      </td>

                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#cbd5e1" }}>
                          <Briefcase size={13} style={{ color: "#94a3b8" }} />
                          {u.Departamento || "Sin asignar"}
                        </span>
                      </td>

                      <td>
                        <span className="text-muted text-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Phone size={12} /> {u.Telefono || "No registrado"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            estaActivo ? "badge-exito" : "badge-peligro"
                          }`}
                        >
                          {estaActivo ? "Activo" : "Suspendido"}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                          {esAdmin && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={(e) => abrirModalEditar(u, e)}
                              title="Editar empleado"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/rrhh/${u.Id}`);
                            }}
                          >
                            Ver Perfil <ArrowRight size={14} />
                          </button>
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

      {/* Modal para Crear y Editar */}
      {modalAbierto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            className="erp-card"
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "26px",
              backgroundColor: "#1e293b",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
                {modoEdicion ? "Modificar Datos del Colaborador" : "Dar de Alta Nuevo Colaborador"}
              </h3>
              <button
                className="btn-toggle-eye"
                onClick={() => setModalAbierto(false)}
                style={{ cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {errorModal && (
              <div className="login-alert-error" style={{ marginBottom: "16px" }}>
                <span>{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: "4px" }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    padding: "9px 12px",
                    borderRadius: "6px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: "4px" }}>
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    padding: "9px 12px",
                    borderRadius: "6px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: "4px" }}>
                  {modoEdicion ? "Nueva Contraseña (dejar en blanco para mantener actual)" : "Contraseña de Acceso *"}
                </label>
                <input
                  type="password"
                  required={!modoEdicion}
                  placeholder={modoEdicion ? "••••••••" : "Asigne una contraseña"}
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    padding: "9px 12px",
                    borderRadius: "6px",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: "4px" }}>
                    Rol en Sistema *
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    style={{
                      width: "100%",
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: "#f8fafc",
                      padding: "9px 12px",
                      borderRadius: "6px",
                    }}
                  >
                    {ROLES_DISPONIBLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: "4px" }}>
                    Departamento *
                  </label>
                  <select
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    style={{
                      width: "100%",
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: "#f8fafc",
                      padding: "9px 12px",
                      borderRadius: "6px",
                    }}
                  >
                    {DEPARTAMENTOS_DISPONIBLES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: "4px" }}>
                  Teléfono Directo
                </label>
                <input
                  type="text"
                  placeholder="5555-0000"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    padding: "9px 12px",
                    borderRadius: "6px",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "14px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? (
                    <>
                      <Loader2 size={16} className="spin-icon" /> Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> {modoEdicion ? "Guardar Cambios" : "Crear Empleado"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RRHH;