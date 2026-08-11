const { getConnection, sql } = require("./db");

async function registrarAuditoria(usuarioId, accion, detalle) {
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("usuarioId", sql.Int, usuarioId)
      .input("accion", sql.NVarChar, accion)
      .input("detalle", sql.NVarChar, detalle)
      .query(
        `INSERT INTO Auditoria (UsuarioId, Accion, Detalle)
         VALUES (@usuarioId, @accion, @detalle)`
      );
  } catch (err) {
    console.error("Error al registrar auditoría:", err);
  }
}

module.exports = { registrarAuditoria };