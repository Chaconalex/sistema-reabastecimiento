import { useState, useEffect } from "react";

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

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!resumen) return <p>Cargando...</p>;

    return (
    <div>
      <h1>Finanzas — Gasto en reabastecimiento</h1>

      <div className="card">
        <p className="stat-numero">Q {resumen.gastoTotal.toFixed(2)}</p>
        <p className="stat-label">Gasto total generado por órdenes de compra</p>
      </div>

      <h2>Gasto por producto</h2>
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