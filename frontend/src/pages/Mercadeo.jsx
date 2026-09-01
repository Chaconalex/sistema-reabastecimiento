import { useState, useEffect } from "react";
import { Tag } from "lucide-react";

function Mercadeo({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");

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

  const categorias = ["Todas", ...new Set(productos.map((p) => p.Categoria))];

  const productosFiltrados =
    categoriaFiltro === "Todas"
      ? productos
      : productos.filter((p) => p.Categoria === categoriaFiltro);

  return (
    <div>
      <h1>Mercadeo — Catálogo y promociones</h1>

      <div style={{ marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setCategoriaFiltro(c)}
            className={c === categoriaFiltro ? "btn" : "btn btn-secundario"}
          >
            {c}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {productosFiltrados.map((p) => {
          const precioConDescuento = p.EnPromocion
            ? (p.PrecioUnitario * (1 - p.PorcentajeDescuento / 100)).toFixed(2)
            : null;

          return (
            <div className="card" key={p.Id}>
              <span className="badge badge-verde" style={{ marginBottom: "8px" }}>
                {p.Categoria}
              </span>
              <h3 style={{ margin: "4px 0" }}>{p.Nombre}</h3>

              {p.EnPromocion ? (
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ textDecoration: "line-through", color: "var(--texto-secundario)" }}>
                    Q {p.PrecioUnitario}
                  </span>{" "}
                  <span style={{ color: "var(--rojo-alerta)", fontWeight: 700 }}>
                    Q {precioConDescuento}
                  </span>
                  <div>
                    <span className="badge badge-rojo">
                      <Tag size={11} style={{ verticalAlign: "middle" }} /> -{p.PorcentajeDescuento}%
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ fontWeight: 600 }}>Q {p.PrecioUnitario}</p>
              )}

              <button className="btn" onClick={() => togglePromocion(p)} style={{ width: "100%" }}>
                {p.EnPromocion ? "Quitar promoción" : "Activar promoción"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Mercadeo;