"use client";

import { useEffect, useState } from "react";
import "./usuarios.css";

interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
  activo: number;
  aprobado: number;
  fecha_creacion: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsuarios() {
    try {
      const res = await fetch("/api/usuarios");
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function toggleEstado(id: number, current: number) {
    try {
      await fetch(`/api/usuarios/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ activo: current === 1 ? 0 : 1 }),
      });
      fetchUsuarios();
    } catch (error) {
      alert("Error al cambiar estado");
    }
  }

  async function toggleAprobado(id: number, current: number) {
    try {
      await fetch(`/api/usuarios/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ aprobado: current === 1 ? 0 : 1 }),
      });
      fetchUsuarios();
    } catch (error) {
      alert("Error al aprobar/rechazar");
    }
  }

  async function resetPassword(id: number) {
    const confirm = window.confirm("¿Seguro que deseas restablecer la contraseña a '123456' para este usuario?");
    if (!confirm) return;

    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ reset_password: true, new_password: "123456" }),
      });
      if (res.ok) {
        alert("Contraseña restablecida exitosamente a '123456'.");
      } else {
        alert("Error al restablecer la contraseña.");
      }
    } catch (error) {
      alert("Error inesperado al restablecer la contraseña.");
    }
  }

  return (
    <div className="usuariosContainer">
      <header className="header">
        <h1>Gestión de Usuarios</h1>
        <p>Control de acceso para empleados y administradores.</p>
      </header>

      <div className="tableWrapper">
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Cargando usuarios...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Aprobación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id_usuario}>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>{u.rol}</td>
                  <td>
                    <span className={`badge ${u.activo ? "badgeActive" : "badgeInactive"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.aprobado ? "badgeActive" : "badgePending"}`}>
                      {u.aprobado ? "Aprobado" : "Pendiente"}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="actionBtn" 
                      onClick={() => toggleEstado(u.id_usuario, u.activo)}
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button 
                      className={`actionBtn ${!u.aprobado ? "actionBtnApprove" : ""}`}
                      onClick={() => toggleAprobado(u.id_usuario, u.aprobado)}
                    >
                      {u.aprobado ? "Revocar" : "Aprobar"}
                    </button>
                    <button 
                      className="actionBtn" 
                      onClick={() => resetPassword(u.id_usuario)}
                      title="Restablecer contraseña a 123456"
                    >
                      🔑 Reset API
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
