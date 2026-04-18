"use client";

import { useState } from "react";
import "./perfil.css";

export default function PerfilPage() {
  const [formData, setFormData] = useState({
    password_viejo: "",
    password_nuevo: "",
    confirmar_password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (formData.password_nuevo !== formData.confirmar_password) {
        setError("Las contraseñas nuevas no coinciden.");
        return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/cambiar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            password_viejo: formData.password_viejo,
            password_nuevo: formData.password_nuevo
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al cambiar contraseña");
      }

      setSuccess(data.message);
      setFormData({ password_viejo: "", password_nuevo: "", confirmar_password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="perfilContainer">
      <header className="perfilHeader">
        <h1>Mi Perfil</h1>
        <p>Actualiza tus credenciales de seguridad.</p>
      </header>

      <div className="perfilCard">
        <h2>Cambiar Contraseña</h2>
        <br/>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label className="label" htmlFor="password_viejo">Contraseña Actual</label>
            <input
              id="password_viejo"
              type="password"
              className="input"
              required
              value={formData.password_viejo}
              onChange={(e) => setFormData({ ...formData, password_viejo: e.target.value })}
            />
          </div>

          <div className="formGroup">
            <label className="label" htmlFor="password_nuevo">Nueva Contraseña</label>
            <input
              id="password_nuevo"
              type="password"
              className="input"
              required
              minLength={6}
              value={formData.password_nuevo}
              onChange={(e) => setFormData({ ...formData, password_nuevo: e.target.value })}
            />
          </div>

          <div className="formGroup">
            <label className="label" htmlFor="confirmar_password">Confirmar Nueva Contraseña</label>
            <input
              id="confirmar_password"
              type="password"
              className="input"
              required
              minLength={6}
              value={formData.confirmar_password}
              onChange={(e) => setFormData({ ...formData, confirmar_password: e.target.value })}
            />
          </div>

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
