import { useState, useEffect } from "react";

function Ventas({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);

  function cargarProductos() {
    fetch("http://localhost:3000/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data));
  }

  function cargarOrdenes() {
    fetch("http://localhost:3000/ordenes")
      .then((res) => res.json())
      .then((data) => setOrdenes(data));
  }

  useEffect(() => {
    cargarProductos();
    cargarOrdenes();
  }, []);

  async function venderProducto(id) {
    await fetch(`http://localhost:3000/productos/${id}/vender`, {
      method: "POST",
      headers: { Authorization: `Bearer ${usuario.token}` },
    });
    cargarProductos();
    cargarOrdenes();
  }

  return (
    <div>
      <h1>Ventas e inventario</h1>
      <ul>
        {productos.map((p) => (
          <li key={p.Id}>
            {p.Nombre} — stock: {p.Stock}
            <button onClick={() => venderProducto(p.Id)}>
              Registrar venta
            </button>
          </li>
        ))}
      </ul>

      <h2>Órdenes de compra generadas</h2>
      {ordenes.length === 0 && <p>Todavía no hay órdenes generadas.</p>}
      <ul>
        {ordenes.map((o) => (
          <li key={o.Id}>
            {o.Producto} — {o.Cantidad} unidades — estado: {o.Estado}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Ventas;