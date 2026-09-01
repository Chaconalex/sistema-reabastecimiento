import { useState, useEffect } from "react";
import { AlertTriangle, ShoppingCart, DollarSign, Users, Megaphone } from "lucide-react";

function Dashboard({ usuario }) {
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/dashboard/resumen", {
      headers: { Authorization: `Bearer ${usuario.token}` },
    })
      .then((res) => res.json())
      .then((data) => setResumen(data));
  }, [usuario]);

  if (!resumen) return <p>Cargando...</p>;

  const tarjetas = [
    {
      icono: AlertTriangle,
      valor: resumen.productosBajoStock,
      etiqueta: "Productos en bajo stock",
    },
    {
      icono: ShoppingCart,
      valor: resumen.ordenesPendientes,
      etiqueta: "Órdenes pendientes de recibir",
    },
    {
      icono: DollarSign,
      valor: `Q ${resumen.gastoTotal.toFixed(2)}`,
      etiqueta: "Gasto total en órdenes",
    },
    {
      icono: Users,
      valor: resumen.totalEmpleados,
      etiqueta: "Empleados en el sistema",
    },
    {
      icono: Megaphone,
      valor: resumen.promocionesActivas,
      etiqueta: "Promociones activas",
    },
  ];

  return (
    <div>
      <h1>Bienvenido, {usuario.nombre}</h1>
      <p style={{ color: "var(--texto-secundario)" }}>
        Resumen general de Soluciones Informáticas
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        {tarjetas.map((t, i) => {
          const Icono = t.icono;
          return (
            <div className="card" key={i}>
              <Icono size={22} color="var(--azul-primario)" />
              <p className="stat-numero">{t.valor}</p>
              <p className="stat-label">{t.etiqueta}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;