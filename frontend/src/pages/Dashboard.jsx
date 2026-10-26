import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Users,
  Megaphone,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  PackageX
} from "lucide-react";

function Dashboard({ usuario }) {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let montado = true;
    setCargando(true);
    fetch("http://localhost:3000/dashboard/resumen", {
      headers: { Authorization: `Bearer ${usuario.token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error en la petición");
        return res.json();
      })
      .then((data) => {
        if (montado) {
          setResumen(data);
          setCargando(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (montado) setCargando(false);
      });

    return () => {
      montado = false;
    };
  }, [usuario]);

  if (cargando) {
    return (
      <div className="erp-loading-skeleton">
        <div className="skeleton-title"></div>
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!resumen) {
    return (
      <div className="erp-card-vacio">
        <AlertTriangle size={36} className="text-warning" />
        <p>No se pudo cargar la información del panel.</p>
      </div>
    );
  }

  const kpis = [
    {
      titulo: "Bajo Stock",
      valor: resumen.productosBajoStock,
      icono: PackageX,
      tipo: resumen.productosBajoStock > 0 ? "peligro" : "exito",
      subtexto: resumen.productosBajoStock > 0 ? "Requiere reposición" : "Nivel óptimo",
      accion: () => navigate("/ventas"),
    },
    {
      titulo: "Órdenes Pendientes",
      valor: resumen.ordenesPendientes,
      icono: ShoppingCart,
      tipo: resumen.ordenesPendientes > 0 ? "alerta" : "neutral",
      subtexto: "Por ingresar al almacén",
      accion: () => navigate("/ventas"),
    },
    {
      titulo: "Gasto en Órdenes",
      valor: `Q ${Number(resumen.gastoTotal || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`,
      icono: DollarSign,
      tipo: "primario",
      subtexto: "Inversión acumulada",
    },
    {
      titulo: "Personal Activo",
      valor: resumen.totalEmpleados,
      icono: Users,
      tipo: "info",
      subtexto: "Registrados en el sistema",
      accion: () => navigate("/rrhh"),
    },
    {
      titulo: "Promociones Activas",
      valor: resumen.promocionesActivas,
      icono: Megaphone,
      tipo: "secundario",
      subtexto: "Campañas en curso",
      accion: () => navigate("/mercadeo"),
    },
  ];

  const accesosRapidos = [
    { path: "/ventas", label: "Punto de Venta / Stock", desc: "Registrar salidas y compras", icono: ShoppingCart },
    { path: "/mercadeo", label: "Campañas y Promos", desc: "Descuentos y marketing", icono: Megaphone },
    { path: "/rrhh", label: "Módulo RRHH", desc: "Planilla y colaboradores", icono: Users },
    { path: "/auditoria", label: "Bitácora de Eventos", desc: "Trazabilidad del sistema", icono: ClipboardList },
  ];

  return (
    <div className="dashboard-container">
      {/* Banner Superior */}
      <div className="dashboard-header">
        <div>
          <h2>Panel de Control</h2>
          <p className="subtitulo">
            Bienvenido, <strong>{usuario.nombre}</strong> · Resumen operativo en tiempo real.
          </p>
        </div>
        <div className="status-pill">
          <span className="dot-live"></span> Sistema operativo
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => {
          const Icono = kpi.icono;
          return (
            <div
              key={idx}
              className={`kpi-card kpi-${kpi.tipo} ${kpi.accion ? "clickable" : ""}`}
              onClick={kpi.accion}
            >
              <div className="kpi-top">
                <span className="kpi-titulo">{kpi.titulo}</span>
                <div className="kpi-icon-wrapper">
                  <Icono size={20} />
                </div>
              </div>
              <div className="kpi-valor">{kpi.valor}</div>
              <div className="kpi-subtexto">{kpi.subtexto}</div>
            </div>
          );
        })}
      </div>

      {/* Grid Central */}
      <div className="dashboard-main-grid">
        {/* Accesos rápidos */}
        <div className="erp-card">
          <div className="card-header">
            <h3>Operaciones Frecuentes</h3>
            <small>Atajos del sistema</small>
          </div>
          <div className="accesos-list">
            {accesosRapidos.map((acc, i) => {
              const Icono = acc.icono;
              return (
                <button
                  key={i}
                  className="acceso-btn"
                  onClick={() => navigate(acc.path)}
                >
                  <div className="acceso-info">
                    <div className="acceso-icon-box">
                      <Icono size={18} />
                    </div>
                    <div>
                      <strong>{acc.label}</strong>
                      <p>{acc.desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="acceso-arrow" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="erp-card">
          <div className="card-header">
            <h3>Registro de Auditoría Reciente</h3>
            <small>Últimos movimientos</small>
          </div>
          <div className="actividad-feed">
            {(!resumen.actividadReciente || resumen.actividadReciente.length === 0) ? (
              <p className="text-muted text-center py-4">No hay actividad registrada en la bitácora.</p>
            ) : (
              resumen.actividadReciente.slice(0, 6).map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-user">{item.Usuario}</span>
                      <span className="timeline-date">
                        <Clock size={12} /> {item.CreadoEn}
                      </span>
                    </div>
                    <p className="timeline-text">{item.Detalle}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;