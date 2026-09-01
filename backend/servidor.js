const express = require("express");
const cors = require("cors");
const { sql, getConnection } = require("./db");
const app = express();
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { requiereLogin, requiereRol } = require("./auth");
const { registrarAuditoria } = require("./auditoria");

app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const pool = await getConnection();
    const resultado = await pool
      .request()
      .input("correo", sql.NVarChar, correo)
      .query("SELECT * FROM Usuarios WHERE Correo = @correo");

    const usuario = resultado.recordset[0];
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const coincide = await bcrypt.compare(contrasena, usuario.ContrasenaHash);
    if (!coincide) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.Id, nombre: usuario.Nombre, rol: usuario.Rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    await registrarAuditoria(usuario.Id, "login", `${usuario.Nombre} inició sesión`);

    res.json({ token, nombre: usuario.Nombre, rol: usuario.Rol });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

app.get("/productos", async (req, res) => {
  try {
    const pool = await getConnection();
    const resultado = await pool.request().query("SELECT * FROM Productos");
    res.json(resultado.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar productos" });
  }
});

app.post(
  "/productos/:id/vender",
  requiereLogin,
  requiereRol("compras", "administrador"),
  async (req, res) => {
    const id = Number(req.params.id);

    try {
      const pool = await getConnection();

      // 1. Traer el producto
      const productoResult = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM Productos WHERE Id = @id");

      const producto = productoResult.recordset[0];
      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // 2. Bajar el stock (nunca menos de 0)
      const nuevoStock = Math.max(0, producto.Stock - 3);
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("stock", sql.Int, nuevoStock)
        .query("UPDATE Productos SET Stock = @stock WHERE Id = @id");

      // 3. Revisar si toca generar una orden
      let ordenGenerada = null;
      if (nuevoStock <= producto.PuntoReorden) {
        const ordenAbierta = await pool
          .request()
          .input("id", sql.Int, id)
          .query(
            "SELECT * FROM Ordenes WHERE ProductoId = @id AND Estado != 'recibida'"
          );

        if (ordenAbierta.recordset.length === 0) {
          const insertResult = await pool
            .request()
            .input("id", sql.Int, id)
            .input("cantidad", sql.Int, producto.CantidadReorden)
            .query(
              `INSERT INTO Ordenes (ProductoId, Cantidad, Estado)
               OUTPUT INSERTED.*
               VALUES (@id, @cantidad, 'enviada')`
            );
          ordenGenerada = insertResult.recordset[0];
        }
      }
await registrarAuditoria(
  req.usuario.id,
  "venta",
  `${req.usuario.nombre} vendió unidades de ${producto.Nombre} (stock resultante: ${nuevoStock})`
);
      res.json({ stock: nuevoStock, ordenGenerada });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al procesar la venta" });
    }
  }
);

app.get("/ordenes", async (req, res) => {
  try {
    const pool = await getConnection();
    const resultado = await pool.request().query(`
      SELECT o.Id, o.Cantidad, o.Estado, o.CreadoEn, p.Nombre AS Producto
      FROM Ordenes o
      JOIN Productos p ON p.Id = o.ProductoId
      ORDER BY o.Id DESC
    `);
    res.json(resultado.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar órdenes" });
  }
});

app.get("/usuarios", requiereLogin, async (req, res) => {
  try {
    const pool = await getConnection();
    const resultado = await pool
      .request()
      .query("SELECT Id, Nombre, Correo, Rol, Departamento FROM Usuarios");
    res.json(resultado.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar usuarios" });
  }
});

app.get(
  "/auditoria",
  requiereLogin,
  requiereRol("administrador", "gerencia"),
  async (req, res) => {
    try {
      const pool = await getConnection();
      const resultado = await pool.request().query(`
        SELECT a.Id, a.Accion, a.Detalle, a.CreadoEn, u.Nombre AS Usuario
        FROM Auditoria a
        JOIN Usuarios u ON u.Id = a.UsuarioId
        ORDER BY a.Id DESC
      `);
      res.json(resultado.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al consultar auditoría" });
    }
  }
);

app.get(
  "/finanzas/resumen",
  requiereLogin,
  requiereRol("administrador", "gerencia"),
  async (req, res) => {
    try {
      const pool = await getConnection();

      const total = await pool.request().query(`
        SELECT SUM(o.Cantidad * p.PrecioUnitario) AS GastoTotal
        FROM Ordenes o
        JOIN Productos p ON p.Id = o.ProductoId
      `);

      const porProducto = await pool.request().query(`
        SELECT p.Nombre AS Producto,
               SUM(o.Cantidad) AS UnidadesOrdenadas,
               SUM(o.Cantidad * p.PrecioUnitario) AS Gasto
        FROM Ordenes o
        JOIN Productos p ON p.Id = o.ProductoId
        GROUP BY p.Nombre
        ORDER BY Gasto DESC
      `);

      res.json({
        gastoTotal: total.recordset[0].GastoTotal || 0,
        porProducto: porProducto.recordset,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al consultar finanzas" });
    }
  }
);

app.post(
  "/productos/:id/promocion",
  requiereLogin,
  requiereRol("administrador", "gerencia"),
  async (req, res) => {
    const id = Number(req.params.id);
    const { activar, porcentaje } = req.body;

    try {
      const pool = await getConnection();
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("activar", sql.Bit, activar)
        .input("porcentaje", sql.Int, activar ? porcentaje : null)
        .query(
          `UPDATE Productos
           SET EnPromocion = @activar, PorcentajeDescuento = @porcentaje
           WHERE Id = @id`
        );

      await registrarAuditoria(
        req.usuario.id,
        "promocion",
        `${req.usuario.nombre} ${activar ? "activó" : "desactivó"} promoción en producto ${id}`
      );

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al actualizar promoción" });
    }
  }
);


app.post(
  "/ordenes/:id/recibir",
  requiereLogin,
  requiereRol("compras", "administrador"),
  async (req, res) => {
    const id = Number(req.params.id);

    try {
      const pool = await getConnection();

      const ordenResult = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM Ordenes WHERE Id = @id");

      const orden = ordenResult.recordset[0];
      if (!orden) {
        return res.status(404).json({ error: "Orden no encontrada" });
      }
      if (orden.Estado === "recibida") {
        return res.status(400).json({ error: "Esta orden ya fue recibida" });
      }

      await pool
        .request()
        .input("id", sql.Int, id)
        .query("UPDATE Ordenes SET Estado = 'recibida' WHERE Id = @id");

      await pool
        .request()
        .input("productoId", sql.Int, orden.ProductoId)
        .input("cantidad", sql.Int, orden.Cantidad)
        .query(
          "UPDATE Productos SET Stock = Stock + @cantidad WHERE Id = @productoId"
        );

      await registrarAuditoria(
        req.usuario.id,
        "recepcion",
        `${req.usuario.nombre} marcó como recibida la orden #${id} (+${orden.Cantidad} unidades)`
      );

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al recibir la orden" });
    }
  }
);


app.get("/dashboard/resumen", requiereLogin, async (req, res) => {
  try {
    const pool = await getConnection();

    const productos = await pool
      .request()
      .query("SELECT COUNT(*) AS Total FROM Productos WHERE Stock <= PuntoReorden");

    const ordenesPendientes = await pool
      .request()
      .query("SELECT COUNT(*) AS Total FROM Ordenes WHERE Estado != 'recibida'");

    const gasto = await pool.request().query(`
      SELECT SUM(o.Cantidad * p.PrecioUnitario) AS GastoTotal
      FROM Ordenes o
      JOIN Productos p ON p.Id = o.ProductoId
    `);

    const empleados = await pool.request().query("SELECT COUNT(*) AS Total FROM Usuarios");

    const promociones = await pool
      .request()
      .query("SELECT COUNT(*) AS Total FROM Productos WHERE EnPromocion = 1");

    res.json({
      productosBajoStock: productos.recordset[0].Total,
      ordenesPendientes: ordenesPendientes.recordset[0].Total,
      gastoTotal: gasto.recordset[0].GastoTotal || 0,
      totalEmpleados: empleados.recordset[0].Total,
      promocionesActivas: promociones.recordset[0].Total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar el dashboard" });
  }
});


app.get("/usuarios/:id", requiereLogin, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const pool = await getConnection();

    const usuarioResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        `SELECT Id, Nombre, Correo, Rol, Departamento, Telefono, FechaContratacion, Activo
         FROM Usuarios WHERE Id = @id`
      );

    const usuarioEncontrado = usuarioResult.recordset[0];
    if (!usuarioEncontrado) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    const actividad = await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        `SELECT TOP 10 Accion, Detalle, CreadoEn
         FROM Auditoria WHERE UsuarioId = @id
         ORDER BY Id DESC`
      );

    res.json({ ...usuarioEncontrado, actividad: actividad.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar el empleado" });
  }
});

app.post(
  "/usuarios/:id/estado",
  requiereLogin,
  requiereRol("administrador"),
  async (req, res) => {
    const id = Number(req.params.id);
    const { activo } = req.body;

    try {
      const pool = await getConnection();
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("activo", sql.Bit, activo)
        .query("UPDATE Usuarios SET Activo = @activo WHERE Id = @id");

      await registrarAuditoria(
        req.usuario.id,
        "estado_empleado",
        `${req.usuario.nombre} ${activo ? "activó" : "desactivó"} al empleado #${id}`
      );

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al actualizar el estado" });
    }
  }
);

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});