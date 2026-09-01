import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function PerfilEmpleado({ usuario }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState(null);

  function cargar() {
    fetch(`http://localhost:3000/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${usuario.token}` },
    })
      .then((res) => res.json())
      .then((data) => setEmpleado(data));
  }

  useEffect(() => {
    cargar();
  }, [id]);

  async function cambiarEstado() {
    await fetch(`http://localhost:3000/usuarios/${id}/estado`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usuario.token}`,
      },
      body: JSON.stringify({ activo: !empleado.Activo }),
    });
    cargar();
  }

  if (!empleado) return <p>Cargando...</p>;

  return (
    <div>
      <button
        className="btn btn-secundario"
        onClick={() => navigate("/rrhh")}
        style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}
      >
        <ArrowLeft size={16} /> Volver al directorio
      </button>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ marginBottom: "4px" }}>{empleado.Nombre}</h1>
            <p style={{ color: "var(--texto-secundario)" }}>
              {empleado.Departamento} · {empleado.Rol}
            </p>
          </div>
          <span className={`badge ${empleado.Activo ? "badge-verde" : "badge-rojo"}`}>
            {empleado.Activo ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <p><strong>Correo:</strong> {empleado.Correo}</p>
          <p><strong>Teléfono:</strong> {empleado.Telefono || "—"}</p>
          <p><strong>Fecha de contratación:</strong> {empleado.FechaContratacion?.slice(0, 10) || "—"}</p>
        </div>

        {usuario.rol === "administrador" && (
          <button className="btn" style={{ marginTop: "16px" }} onClick={cambiarEstado}>
            {empleado.Activo ? "Desactivar empleado" : "Activar empleado"}
          </button>
        )}
      </div>

      <h2>Actividad reciente</h2>
      <div className="card">
        {empleado.actividad.length === 0 && <p>Sin actividad registrada.</p>}
        {empleado.actividad.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {empleado.actividad.map((a, i) => (
                <tr key={i}>
                  <td>{a.CreadoEn}</td>
                  <td><span className="badge badge-verde">{a.Accion}</span></td>
                  <td>{a.Detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PerfilEmpleado;