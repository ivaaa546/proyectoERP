"use client";

import { useEffect, useState } from "react";
import "./clientes.css";

type Cliente = {
  id_cliente: number;
  nombres: string;
  apellidos: string;
  documento_identidad: string;
  telefono: string;
  activo: boolean;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    documento_identidad: "",
    telefono: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/clientes", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setClientes(data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleEstado(id: number, currentEstado: boolean) {
    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !currentEstado }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error toggling state:", error);
    }
  }

  function handleEdit(cli: Cliente) {
    setEditingId(cli.id_cliente);
    setFormData({
      nombres: cli.nombres || "",
      apellidos: cli.apellidos || "",
      documento_identidad: cli.documento_identidad || "",
      telefono: cli.telefono || "",
    });
    setShowModal(true);
  }

  function handleAdd() {
    setEditingId(null);
    setFormData({ nombres: "", apellidos: "", documento_identidad: "", telefono: "" });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const url = editingId ? `/api/clientes/${editingId}` : "/api/clientes";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.ok) {
        setMessage({ text: `Cliente ${editingId ? "actualizado" : "registrado"} con éxito`, type: "success" });
        setShowModal(false);
        fetchData();
      } else {
        setMessage({ text: data.message || "Error en la operación", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error de conexión", type: "error" });
    }
  }

  return (
    <div className="clientesContainer">
      <header className="pageHeader">
        <div className="headerLeft">
          <h1>Gestión de Clientes</h1>
          <p>Base de datos de compradores</p>
        </div>
        <button className="addBtn" onClick={handleAdd}>+ Nuevo Cliente</button>
      </header>

      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="closeAlert">×</button>
        </div>
      )}

      <div className="tableWrapper">
        {loading ? (
          <div className="loadingState">Cargando clientes...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Nombre Completo</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cli) => (
                <tr key={cli.id_cliente} className={!cli.activo ? "rowInactive" : ""}>
                  <td width="50">
                    <span className={`statusDot ${cli.activo ? "active" : "inactive"}`}></span>
                  </td>
                  <td>
                    <strong>{cli.nombres} {cli.apellidos}</strong>
                  </td>
                  <td><span className="clienteDoc">{cli.documento_identidad}</span></td>
                  <td>{cli.telefono || "N/A"}</td>
                  <td>
                    <div className="actionButtons">
                      <button className="editBtn" onClick={() => handleEdit(cli)}>Editar</button>
                      <button 
                        className={`toggleBtn ${cli.activo ? "btnDesactivar" : "btnActivar"}`}
                        onClick={() => handleToggleEstado(cli.id_cliente, cli.activo)}
                      >
                        {cli.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h2>{editingId ? "Editar Cliente" : "Nuevo Cliente"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="formGroup">
                  <label>Nombres</label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  />
                </div>
                <div className="formGroup">
                  <label>Apellidos</label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  />
                </div>
              </div>
              <div className="formGroup">
                <label>Documento de Identidad (DPI/NIT)</label>
                <input
                  type="text"
                  required
                  value={formData.documento_identidad}
                  onChange={(e) => setFormData({ ...formData, documento_identidad: e.target.value })}
                />
              </div>
              <div className="formGroup">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div className="modalActions">
                <button type="button" className="cancelBtn" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="submitBtn">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
