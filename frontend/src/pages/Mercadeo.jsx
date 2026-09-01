import { useState, useEffect } from "react";

function Mercadeo({ usuario }) {
  const [productos, setProductos] = useState([]);

  function cargarProductos() {
    fetch("http://localhost:3000/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data));
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  async function togglePromocion(p) {
    const activar = !p.EnPromocion;
    const porcentaje = activar
      ? Number(prompt("¿Qué porcentaje de descuento? (ej. 15)", "15"))
      : null;

    if (activar && (!porcentaje || porcentaje <= 0)) return;

    await fetch(`http://localhost:3000/productos/${p.Id}/promocion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usuario.token}`,
      },
      body: JSON.stringify({ activar, porcentaje }),
    });
    cargarProductos();
  }

  return (
    <div>
      <h1>Mercadeo — Promociones</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Promoción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.Id}>
                <td>{p.Nombre}</td>
                <td>Q {p.PrecioUnitario}</td>
                <td>
                  {p.EnPromocion ? (
                    <span className="badge badge-verde">
                      {p.PorcentajeDescuento}% de descuento
                    </span>
                  ) : (
                    <span style={{ color: "var(--texto-secundario)" }}>—</span>
                  )}
                </td>
                <td>
                  <button className="btn" onClick={() => togglePromocion(p)}>
                    {p.EnPromocion ? "Quitar promoción" : "Activar promoción"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Mercadeo;