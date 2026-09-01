import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Ventas({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [resumenVentas, setResumenVentas] = useState([]);

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

  function cargarHistorial() {
    fetch("http://localhost:3000/ventas/historial", {
      headers: { Authorization: `Bearer ${usuario.token}` },
    })
      .then((res) => res.json())
      .then((data) => setHistorial(data));
  }

  function cargarResumen() {
    fetch("http://localhost:3000/ventas/resumen", {
      headers: { Authorization: `Bearer ${usuario.token}` },
    })
      .then((res) => res.json())
      .then((data) => setResumenVentas(data));
  }

  useEffect(() => {
    cargarProductos();
    cargarOrdenes();
    cargarHistorial();
    cargarResumen();
  }, [usuario]);

  async function venderProducto(id) {
    await fetch(`http://localhost:3000/productos/${id}/vender`, {
      method: "POST",
      headers: { Authorization: `Bearer ${usuario.token}` },
    });
    cargarProductos();
    cargarOrdenes();
    cargarHistorial();
    cargarResumen();
  }

  async function recibirOrden(id) {
    await fetch(`http://localhost:3000/ordenes/${id}/recibir`, {
      method: "POST",
      headers: { Authorization: `Bearer ${usuario.token}` },
    });
    cargarProductos();
    cargarOrdenes();
  }

  return (
    <div>
      <h1>Ventas e inventario</h1>

      {resumenVentas.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Unidades vendidas por producto</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={resumenVentas}>
              <XAxis dataKey="Producto" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="UnidadesVendidas" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.Id}>
                  <td>{o.Producto}</td>
                  <td>{o.Cantidad} unidades</td>
                  <td>
                    <span
                      className={`badge ${
                        o.Estado === "recibida" ? "badge-verde" : "badge-rojo"
                      }`}
                    >
                      {o.Estado}
                    </span>
                  </td>
                  <td>
                    {o.Estado !== "recibida" && (
                      <button className="btn" onClick={() => recibirOrden(o.Id)}>
                        Marcar como recibida
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2>Historial de ventas</h2>
      <div className="card">
        {historial.length === 0 && <p>Todavía no hay ventas registradas.</p>}
        {historial.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.Id}>
                  <td>{h.CreadoEn}</td>
                  <td>{h.Producto}</td>
                  <td>{h.Cantidad}</td>
                  <td>{h.Vendedor}</td>
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