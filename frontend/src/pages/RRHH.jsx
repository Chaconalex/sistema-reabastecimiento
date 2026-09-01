import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RRHH({ usuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

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
      <div className="card">
        <table>
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
              <tr
                key={u.Id}
                onClick={() => navigate(`/rrhh/${u.Id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{u.Nombre}</td>
                <td>{u.Correo}</td>
                <td>{u.Rol}</td>
                <td>{u.Departamento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RRHH;