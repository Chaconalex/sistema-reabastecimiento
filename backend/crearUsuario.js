require("dotenv").config();
const bcrypt = require("bcryptjs");
const { getConnection, sql } = require("./db");

async function crearUsuario() {
  const [, , nombre, correo, contrasenaPlano, rol, departamento, telefono, fecha] = process.argv;

  if (!nombre || !correo || !contrasenaPlano || !rol || !departamento) {
    console.log(
      'Uso: node crearUsuario.js "Nombre" correo@ejemplo.com contrasena rol departamento [telefono] [YYYY-MM-DD]'
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
    .input("departamento", sql.NVarChar, departamento)
    .input("telefono", sql.NVarChar, telefono || null)
    .input("fecha", sql.Date, fecha || null)
    .query(
      `INSERT INTO Usuarios (Nombre, Correo, ContrasenaHash, Rol, Departamento, Telefono, FechaContratacion)
       VALUES (@nombre, @correo, @hash, @rol, @departamento, @telefono, @fecha)`
    );

  console.log(`Usuario creado: ${correo} (${rol} — ${departamento})`);
  process.exit();
}

crearUsuario();