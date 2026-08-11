require("dotenv").config();
const bcrypt = require("bcryptjs");
const { getConnection, sql } = require("./db");

async function crearAdmin() {
  const nombre = "Administrador";
  const correo = "admin@solucionesinformaticas.com";
  const contrasenaPlano = "Admin123!";

  const hash = await bcrypt.hash(contrasenaPlano, 10);

  const pool = await getConnection();
  await pool
    .request()
    .input("nombre", sql.NVarChar, nombre)
    .input("correo", sql.NVarChar, correo)
    .input("hash", sql.NVarChar, hash)
    .input("rol", sql.NVarChar, "administrador")
    .query(
      `INSERT INTO Usuarios (Nombre, Correo, ContrasenaHash, Rol)
       VALUES (@nombre, @correo, @hash, @rol)`
    );

  console.log("Usuario administrador creado:", correo);
  process.exit();
}

crearAdmin();