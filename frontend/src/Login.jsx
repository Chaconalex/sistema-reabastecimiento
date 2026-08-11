import { useState } from "react";

function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!res.ok) {
        setError("Correo o contraseña incorrectos");
        return;
      }

      const data = await res.json();
      onLogin(data);
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  }

  return (
    <div style={{ maxWidth: "300px", margin: "80px auto" }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo</label>
          <br />
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label>Contraseña</label>
          <br />
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ marginTop: "10px" }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;