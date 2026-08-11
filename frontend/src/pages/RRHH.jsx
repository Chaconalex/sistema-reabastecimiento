import { useState, useEffect } from "react";

function RRHH({ usuario }) {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/usuarios", {
      headers: { Authorization: `Bearer ${usuario.token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(data));
  }, [usuario]);

  return (
    <div>
      <h1>Recursos Humanos — Directorio de empleados</h1>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Departamento</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.Id}>
              <td>{u.Nombre}</td>
              <td>{u.Correo}</td>
              <td>{u.Rol}</td>
              <td>{u.Departamento}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RRHH;