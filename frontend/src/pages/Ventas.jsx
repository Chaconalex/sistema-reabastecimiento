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

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Stock</th>
              <th>Punto de reorden</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => {
              const bajo = p.Stock <= p.PuntoReorden;
              return (
                <tr key={p.Id}>
                  <td>{p.Nombre}</td>
                  <td>
                    {p.Stock}{" "}
                    {bajo && <span className="badge badge-rojo">Bajo stock</span>}
                  </td>
                  <td>{p.PuntoReorden}</td>
                  <td>
                    <button className="btn" onClick={() => venderProducto(p.Id)}>
                      Registrar venta
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2>Órdenes de compra generadas</h2>
      <div className="card">
        {ordenes.length === 0 && <p>Todavía no hay órdenes generadas.</p>}
        {ordenes.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.Id}>
                  <td>{o.Producto}</td>
                  <td>{o.Cantidad} unidades</td>
                  <td>
                    <span className="badge badge-verde">{o.Estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Ventas;