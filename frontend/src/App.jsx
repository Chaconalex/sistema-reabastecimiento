import { useState, useEffect } from "react";
import Login from "./Login";

function App() {
  const [usuario, setUsuario] = useState(null);
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
    if (usuario) {
      cargarProductos();
      cargarOrdenes();
    }
  }, [usuario]);

  async function venderProducto(id) {
    await fetch(`http://localhost:3000/productos/${id}/vender`, {
      method: "POST",
      headers: { Authorization: `Bearer ${usuario.token}` },
    });
    cargarProductos();
    cargarOrdenes();
  }

  function cerrarSesion() {
    setUsuario(null);
  }

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Inventario</h1>
        <div>
          <span>
            {usuario.nombre} ({usuario.rol})
          </span>{" "}
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </div>

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

export default App;