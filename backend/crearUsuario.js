require("dotenv").config();
const bcrypt = require("bcryptjs");
const { getConnection, sql } = require("./db");

async function crearUsuario() {
  const [, , nombre, correo, contrasenaPlano, rol] = process.argv;

  if (!nombre || !correo || !contrasenaPlano || !rol) {
    console.log(
      "Uso: node crearUsuario.js \"Nombre Completo\" correo@ejemplo.com contrasena rol"
    );
    console.log("Roles válidos: administrador, compras, gerencia");
    process.exit(1);
  }

  const hash = await bcrypt.hash(contrasenaPlano, 10);

  const pool = await getConnection();
  await pool
    .request()
    .input("nombre", sql.NVarChar, nombre)
    .input("correo", sql.NVarChar, correo)
    .input("hash", sql.NVarChar, hash)
    .input("rol", sql.NVarChar, rol)
    .query(
      `INSERT INTO Usuarios (Nombre, Correo, ContrasenaHash, Rol)
       VALUES (@nombre, @correo, @hash, @rol)`
    );

  console.log(`Usuario creado: ${correo} (${rol})`);
  process.exit();
}

crearUsuario();