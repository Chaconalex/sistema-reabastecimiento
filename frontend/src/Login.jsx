import { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!res.ok) {
        setError("Credenciales incorrectas. Verifique su correo y contraseña.");
        setCargando(false);
        return;
      }

      const data = await res.json();
      onLogin(data);
    } catch (err) {
      setError("No se pudo conectar con el servidor backend. Verifique su conexión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card-wrapper">
        {/* Identidad de Marca */}
        <div className="login-brand">
          <div className="login-logo-box">
            <Building2 size={28} />
          </div>
          <h2>Soluciones Informáticas</h2>
          <p>Sistema Integral de Gestión y Reabastecimiento</p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="login-alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Correo Electrónico</label>
            <div className="input-icon-group">
              <Mail size={18} className="field-icon" />
              <input
                type="email"
                placeholder="usuario@empresa.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label>Contraseña</label>
            <div className="input-icon-group">
              <Lock size={18} className="field-icon" />
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                tabIndex={-1}
              >
                {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-login-submit"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <Loader2 size={18} className="spin-icon" /> Validando acceso...
              </>
            ) : (
              <>
                Acceder al Panel <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="login-card-footer">
          <span>Acceso seguro protegido por RBAC y Token JWT</span>
        </div>
      </div>
    </div>
  );
}

export default Login;