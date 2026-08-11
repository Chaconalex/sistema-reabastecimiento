import { useState, useEffect } from "react";

function Auditoria({ usuario }) {
  const [registros, setRegistros] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/auditoria", {
      headers: { Authorization: `Bearer ${usuario.token}` },
    })
      .then((res) => {
        if (res.status === 403) {
          setError("No tienes permiso para ver la auditoría.");
          return [];
        }
        return res.json();
      })
      .then((data) => setRegistros(data || []));
  }, [usuario]);

  return (
    <div>
      <h1>Auditoría — Bitácora de acciones</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r) => (
            <tr key={r.Id}>
              <td>{r.CreadoEn}</td>
              <td>{r.Usuario}</td>
              <td>{r.Accion}</td>
              <td>{r.Detalle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Auditoria;