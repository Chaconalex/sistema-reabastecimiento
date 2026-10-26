import { useState, useEffect, useMemo } from "react";
import {
  Tag,
  Search,
  Percent,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  X,
  RefreshCw,
  SlidersHorizontal,
  Flame,
} from "lucide-react";

function Mercadeo({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [filtroSoloPromos, setFiltroSoloPromos] = useState(false);

  // Estado para el modal de configuración de descuento
  const [modalProducto, setModalProducto] = useState(null);
  const [porcentajeInput, setPorcentajeInput] = useState("15");
  const [procesandoId, setProcesandoId] = useState(null);

  function cargarProductos() {
    setCargando(true);
    fetch("http://localhost:3000/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data || []))
      .catch((err) => console.error("Error al cargar catálogo:", err))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  // Abrir modal o quitar promoción directamente
  async function handleToggleClick(producto) {
    if (producto.EnPromocion) {
      ejecutarCambioPromocion(producto.Id, false, null);
    } else {
      setPorcentajeInput("15");
      setModalProducto(producto);
    }
  }

  async function ejecutarCambioPromocion(id, activar, porcentaje) {
    try {
      setProcesandoId(id);
      await fetch(`http://localhost:3000/productos/${id}/promocion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario?.token}`,
        },
        body: JSON.stringify({ activar, porcentaje }),
      });
      setModalProducto(null);
      cargarProductos();
    } catch (err) {
      alert("Error al actualizar la promoción");
    } finally {
      setProcesandoId(null);
    }
  }

  // Métricas del catálogo
  const totalPromociones = productos.filter((p) => p.EnPromocion).length;
  const porcentajePromocionado = productos.length > 0
    ? Math.round((totalPromociones / productos.length) * 100)
    : 0;

  // Lista de categorías únicas
  const categorias = useMemo(() => {
    const cats = productos.map((p) => p.Categoria).filter(Boolean);
    return ["Todas", ...Array.from(new Set(cats))];
  }, [productos]);

  // Filtros combinados
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchCat = categoriaFiltro === "Todas" || p.Categoria === categoriaFiltro;
      const matchTexto = p.Nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchPromo = !filtroSoloPromos || p.EnPromocion;
      return matchCat && matchTexto && matchPromo;
    });
  }, [productos, categoriaFiltro, busqueda, filtroSoloPromos]);

  return (
    <div className="modulo-mercadeo">
      {/* Encabezado */}
      <div className="modulo-header">
        <div>
          <h2>Campañas Comerciales y Promociones</h2>
          <p className="subtitulo">
            Estrategia de descuentos, catálogo por categoría y dinamización de ventas.
          </p>
        </div>
        <button className="btn btn-outline" onClick={cargarProductos} title="Actualizar catálogo">
          <RefreshCw size={15} /> Sincronizar
        </button>
      </div>

      {/* Tarjetas KPI de Mercadeo */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-primario">
          <div className="kpi-top">
            <span>Catálogo Completo</span>
            <ShoppingBag size={18} />
          </div>
          <div className="kpi-valor">{productos.length}</div>
          <div className="kpi-subtexto">Artículos registrados</div>
        </div>

        <div className="kpi-card kpi-secundario">
          <div className="kpi-top">
            <span>En Promoción</span>
            <Flame size={18} />
          </div>
          <div className="kpi-valor">{totalPromociones}</div>
          <div className="kpi-subtexto">Con descuento activo</div>
        </div>

        <div className="kpi-card kpi-info">
          <div className="kpi-top">
            <span>Cobertura de Ofertas</span>
            <Percent size={18} />
          </div>
          <div className="kpi-valor">{porcentajePromocionado}%</div>
          <div className="kpi-subtexto">Del inventario total</div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="erp-card mb-4">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div className="erp-search-box" style={{ flex: "1 1 260px" }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <button
            className={`btn ${filtroSoloPromos ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFiltroSoloPromos(!filtroSoloPromos)}
          >
            <Sparkles size={15} />
            {filtroSoloPromos ? "Viendo solo ofertas" : "Ver solo ofertas activas"}
          </button>
        </div>

        {/* Botones de categoría */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCategoriaFiltro(c)}
              className={c === categoriaFiltro ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      {cargando ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card" style={{ height: "200px" }}></div>
          ))}
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="erp-card text-center py-5 text-muted">
          <SlidersHorizontal size={36} style={{ margin: "0 auto 10px auto", opacity: 0.5 }} />
          <p>No se encontraron productos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "18px",
          }}
        >
          {productosFiltrados.map((p) => {
            const precioNormal = Number(p.PrecioUnitario || 0);
            const precioDescuento = p.EnPromocion
              ? (precioNormal * (1 - p.PorcentajeDescuento / 100)).toFixed(2)
              : null;

            return (
              <div
                key={p.Id}
                className="erp-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderColor: p.EnPromocion ? "#a855f7" : "#334155",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Ribbon de Descuento */}
                {p.EnPromocion && (
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                    }}
                  >
                    <span className="badge badge-peligro" style={{ fontSize: "0.8rem", padding: "4px 8px" }}>
                      <Tag size={12} /> -{p.PorcentajeDescuento}%
                    </span>
                  </div>
                )}

                <div>
                  <span
                    className="badge badge-neutral"
                    style={{ fontSize: "0.7rem", marginBottom: "8px" }}
                  >
                    {p.Categoria || "General"}
                  </span>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: "600", color: "#f8fafc", margin: "6px 0 14px 0" }}>
                    {p.Nombre}
                  </h3>

                  {/* Precios */}
                  <div style={{ marginBottom: "16px" }}>
                    {p.EnPromocion ? (
                      <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                        <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "#38bdf8" }}>
                          Q {precioDescuento}
                        </span>
                        <span style={{ textDecoration: "line-through", color: "#64748b", fontSize: "0.85rem" }}>
                          Q {precioNormal.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc" }}>
                        Q {precioNormal.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de acción */}
                <button
                  className={`btn ${p.EnPromocion ? "btn-outline" : "btn-primary"}`}
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={procesandoId === p.Id}
                  onClick={() => handleToggleClick(p)}
                >
                  {p.EnPromocion ? (
                    "Quitar Promoción"
                  ) : (
                    <>
                      <Sparkles size={15} /> Aplicar Descuento
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal personalizado para configurar el descuento */}
      {modalProducto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            className="erp-card"
            style={{
              width: "100%",
              maxWidth: "440px",
              padding: "26px",
              backgroundColor: "#1e293b",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem" }}>Crear Descuento</h3>
              <button
                className="btn-toggle-eye"
                onClick={() => setModalProducto(null)}
                style={{ cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "16px" }}>
              Producto: <strong style={{ color: "#f8fafc" }}>{modalProducto.Nombre}</strong> (Precio base: Q{" "}
              {Number(modalProducto.PrecioUnitario).toFixed(2)})
            </p>

            {/* Atajos rápidos de porcentaje */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {[10, 15, 20, 25, 30].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className={porcentajeInput === String(pct) ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                  onClick={() => setPorcentajeInput(String(pct))}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Input manual */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "6px" }}>
                Porcentaje personalizado (%)
              </label>
              <input
                type="number"
                min="1"
                max="95"
                value={porcentajeInput}
                onChange={(e) => setPorcentajeInput(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  color: "#f8fafc",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>

            {/* Simulación del nuevo precio */}
            {Number(porcentajeInput) > 0 && (
              <div
                style={{
                  backgroundColor: "#0f172a",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Precio final al cliente:</span>
                <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#38bdf8" }}>
                  Q {(modalProducto.PrecioUnitario * (1 - Number(porcentajeInput) / 100)).toFixed(2)}
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setModalProducto(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                disabled={!porcentajeInput || Number(porcentajeInput) <= 0 || procesandoId}
                onClick={() =>
                  ejecutarCambioPromocion(modalProducto.Id, true, Number(porcentajeInput))
                }
              >
                <CheckCircle2 size={16} /> Aplicar Promoción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mercadeo;