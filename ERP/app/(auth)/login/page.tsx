"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ correo: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Redirigir al dashboard si todo está bien
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="loginContainer">
      <div className="loginCard">
        <header className="loginHeader">
          <h1>Smart Sales ERP</h1>
          <p>Bienvenido. Ingrese sus credenciales.</p>
        </header>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
              />
            </div>
          </div>

          <div className="formGroup">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label className="label" htmlFor="password" style={{ marginBottom: 0 }}>Contraseña</label>
              <button 
                type="button"
                onClick={() => alert("Por favor solicita a un administrador que restablezca tu contraseña desde el panel de Gestión de Usuarios.")}
                style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="inputWrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>

        <footer className="footer">
          <p>&copy; 2026 Smart Sales Management System</p>
          <p style={{ marginTop: "1rem" }}>
            ¿No tienes cuenta? <Link href="/register" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 500 }}>Regístrate aquí</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
