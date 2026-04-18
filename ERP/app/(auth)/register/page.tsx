"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./register.css";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmarPassword: "",
    id_rol: "2", // Default a Vendedor
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (formData.password !== formData.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario");
      }

      setSuccess(data.message);
      // Redirigir al login tras unos segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="registerContainer">
      <div className="registerCard">
        <header className="registerHeader">
          <h1>Crear Cuenta</h1>
          <p>Únete a Smart Sales ERP</p>
        </header>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}<br/>Redirigiendo al login...</div>}

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label className="label" htmlFor="nombre">Nombre Completo</label>
            <div className="inputWrapper">
              <input
                id="nombre"
                type="text"
                className="input"
                placeholder="Juan Pérez"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                disabled={success !== null}
              />
            </div>
          </div>

          <div className="formGroup">
            <label className="label" htmlFor="correo">Correo Electrónico</label>
            <div className="inputWrapper">
              <input
                id="correo"
                type="email"
                className="input"
                placeholder="usuario@erp.com"
                required
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                disabled={success !== null}
              />
            </div>
          </div>

          <div className="formGroup">
            <label className="label" htmlFor="id_rol">Rol Solicitado</label>
            <div className="inputWrapper">
              <select
                id="id_rol"
                className="select"
                value={formData.id_rol}
                onChange={(e) => setFormData({ ...formData, id_rol: e.target.value })}
                disabled={success !== null}
              >
                <option value="2">Vendedor</option>
                <option value="3">Reportes</option>
              </select>
            </div>
          </div>

          <div className="formGroup">
            <label className="label" htmlFor="password">Contraseña</label>
            <div className="inputWrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input inputPassword"
                placeholder="••••••••"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={success !== null}
              />
              <button
                type="button"
                className="passwordToggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="formGroup">
            <label className="label" htmlFor="confirmarPassword">Confirmar Contraseña</label>
            <div className="inputWrapper">
              <input
                id="confirmarPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="input inputPassword"
                placeholder="••••••••"
                required
                minLength={6}
                value={formData.confirmarPassword}
                onChange={(e) => setFormData({ ...formData, confirmarPassword: e.target.value })}
                disabled={success !== null}
              />
              <button
                type="button"
                className="passwordToggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="button" type="submit" disabled={loading || success !== null}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <footer className="footer">
          ¿Ya tienes una cuenta? <Link href="/login" className="loginLink">Inicia Sesión</Link>
        </footer>
      </div>
    </div>
  );
}
