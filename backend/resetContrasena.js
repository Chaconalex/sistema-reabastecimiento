require("dotenv").config();
const bcrypt = require("bcryptjs");
const { getConnection, sql } = require("./db");

async function resetContrasena() {
  // Se leen los argumentos de la terminal: correo y contraseña nueva
  const [, , correo, contrasenaNueva] = process.argv;

  if (!correo || !contrasenaNueva) {
    console.log("Uso: node resetContrasena.js correo@ejemplo.com NuevaContrasena");
    process.exit(1);
  }

  // Se convierte la contraseña a hash, igual que en crearUsuario.js
  const hash = await bcrypt.hash(contrasenaNueva, 10);

  const pool = await getConnection();
  const resultado = await pool
    .request()
    .input("correo", sql.NVarChar, correo)
    .input("hash", sql.NVarChar, hash)
    .query("UPDATE Usuarios SET ContrasenaHash = @hash WHERE Correo = @correo");

  // rowsAffected indica cuántas filas se modificaron (0 = el correo no existe)
  if (resultado.rowsAffected[0] === 0) {
    console.log("No se encontró ningún usuario con ese correo.");
  } else {
    console.log(`Contraseña actualizada para ${correo}`);
  }
  process.exit();
}

resetContrasena();