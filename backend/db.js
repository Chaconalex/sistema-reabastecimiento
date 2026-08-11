const sql = require("mssql");

const config = {
  user: "app_reabastecimiento",
  password: "ClaveSegura123!",
  server: "localhost",
  database: "ReabastecimientoDB",
  options: {
    trustServerCertificate: true,
    encrypt: false,
  },
};

async function getConnection() {
  return sql.connect(config);
}

module.exports = { sql, getConnection };