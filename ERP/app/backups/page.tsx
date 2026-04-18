"use client";

import { useEffect, useState } from "react";
import "./backups.css";

type LogBackup = {
  id_backup: number;
  id_usuario: number;
  ruta_archivo: string;
  nombre_archivo: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: "EXITOSO" | "FALLIDO" | "PROCESANDO";
  mensaje_error: string | null;
};

export default function BackupsPage() {
  const [history, setHistory] = useState<LogBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [rutaBase, setRutaBase] = useState("C:\\Backups\\");
  const [rutaRestore, setRutaRestore] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch("/api/backups/historial", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (executing) return;
    setExecuting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/backups/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruta_base: rutaBase }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ text: "Backup generado exitosamente", type: "success" });
        fetchHistory();
      } else {
        setMessage({ text: data.message || "Error al generar backup", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setExecuting(false);
    }
  }

  async function handleRestore() {
    if (!rutaRestore) {
      setMessage({ text: "Debe especificar la ruta del archivo para restaurar", type: "error" });
      return;
    }

    if (!confirm("ADVERTENCIA CRÍTICA: La restauración de la base de datos desconectará a todos los usuarios y sobrescribirá los datos actuales. ¿Está TOTALMENTE seguro de continuar?")) {
      return;
    }

    setExecuting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/backups/restaurar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruta_archivo: rutaRestore }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ text: "Base de datos restaurada exitosamente. Se recomienda recargar la aplicación.", type: "success" });
        fetchHistory();
      } else {
        setMessage({ text: data.message || "Error al restaurar backup", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error de conexión durante el restore. Es posible que el servidor se esté reiniciando.", type: "error" });
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="backupsContainer">
      <header className="pageHeader">
        <div className="headerLeft">
          <h1>Mantenimiento y Backups</h1>
          <p>Gestión de respaldos de la base de datos (Nivel Administrador)</p>
        </div>
      </header>

      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="closeAlert">×</button>
        </div>
      )}

      <div className="panelsGrid">
        <section className="panel">
          <h2>📦 Generar Nuevo Backup</h2>
          <div className="formGroup">
            <label>Ruta Base en el Servidor</label>
            <input 
              type="text" 
              value={rutaBase} 
              onChange={(e) => setRutaBase(e.target.value)} 
              placeholder="C:\Backups\"
            />
          </div>
          <button 
            className="actionBtn generateBtn" 
            onClick={handleGenerate}
            disabled={executing}
          >
            {executing ? "Procesando..." : "Ejecutar Backup Full"}
          </button>
        </section>

        <section className="panel">
          <h2>⚠️ Restaurar Base de Datos</h2>
          <div className="formGroup">
            <label>Ruta Completa del Archivo (.bak)</label>
            <input 
              type="text" 
              value={rutaRestore} 
              onChange={(e) => setRutaRestore(e.target.value)} 
              placeholder="C:\Backups\db_backup.bak"
            />
          </div>
          <button 
            className="actionBtn restoreBtn" 
            onClick={handleRestore}
            disabled={executing}
          >
            {executing ? "Procesando Restore..." : "Iniciar Restauración"}
          </button>
        </section>
      </div>

      <div className="tableWrapper">
        <div style={{ padding: "1rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Historial de Backups</h2>
          <button onClick={fetchHistory} style={{ background: "none", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", padding: "0.2rem 0.5rem" }}>Actualizar</button>
        </div>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Cargando historial...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Archivo</th>
                <th>Estado</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>No hay registros de backups.</td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id_backup}>
                    <td>
                      <div style={{ fontWeight: "bold" }}>{new Date(item.fecha_inicio).toLocaleString()}</div>
                      <small style={{ color: "#888" }}>ID: {item.id_backup}</small>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.9rem", color: "#333" }}>{item.nombre_archivo}</div>
                      <div style={{ fontSize: "0.75rem", color: "#999" }}>{item.ruta_archivo}</div>
                    </td>
                    <td>
                      <span className={`statusBadge status-${item.estado}`}>{item.estado}</span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: item.estado === "FALLIDO" ? "#c0392b" : "#666" }}>
                      {item.mensaje_error || (item.estado === "EXITOSO" ? "Completado correctamente" : "-")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
