"use client";

import { useEffect, useState } from "react";
import "./categorias.css";

type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
};

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id_categoria: 0, nombre: "", descripcion: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    try {
      setLoading(true);
      const res = await fetch("/api/categorias");
      const data = await res.json();
      if (data.ok) setCategorias(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre) return;

    try {
      setSubmitting(true);
      const isEdit = form.id_categoria > 0;
      const url = isEdit ? `/api/categorias/${form.id_categoria}` : "/api/categorias";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (data.ok) {
        setForm({ id_categoria: 0, nombre: "", descripcion: "" });
        fetchCategorias();
      } else {
        alert(data.message || "Error al procesar");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(cat: Categoria) {
    try {
      const res = await fetch(`/api/categorias/${cat.id_categoria}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !cat.activo })
      });
      if (res.ok) fetchCategorias();
    } catch (err) {
      alert("Error al cambiar estado");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Seguro que deseas eliminar esta categoría? Esto fallará si tiene productos vinculados.")) return;
    try {
      const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        fetchCategorias();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error al eliminar");
    }
  }

  return (
    <div className="categoryContainer">
      <header className="categoryHeader">
        <h1>Gestión de Categorías</h1>
      </header>

      <form className="categoryForm" onSubmit={handleSubmit}>
        <div className="inputGroup">
          <label>Nombre de Categoría</label>
          <input 
            type="text" 
            placeholder="Ej: Electrónica" 
            value={form.nombre} 
            onChange={(e) => setForm({...form, nombre: e.target.value})}
            required
          />
        </div>
        <div className="inputGroup">
          <label>Descripción (Opcional)</label>
          <input 
            type="text" 
            placeholder="Breve descripción..." 
            value={form.descripcion} 
            onChange={(e) => setForm({...form, descripcion: e.target.value})}
          />
        </div>
        <button className="btnSave" disabled={submitting}>
          {form.id_categoria > 0 ? "Actualizar" : "Crear"}
        </button>
        {form.id_categoria > 0 && (
          <button type="button" className="btnSave" style={{ background: '#64748b' }} onClick={() => setForm({ id_categoria: 0, nombre: "", descripcion: "" })}>
            Cancelar
          </button>
        )}
      </form>

      {loading ? <p>Cargando categorías...</p> : (
        <div className="categoryList">
          {categorias.map(cat => (
            <div key={cat.id_categoria} className={`categoryCard ${!cat.activo ? 'disabled' : ''}`}>
              <div className="cardHeader">
                <h3>{cat.nombre}</h3>
                <span className={`statusBadge ${cat.activo ? 'active' : 'inactive'}`}>
                  {cat.activo ? "Activa" : "Inactiva"}
                </span>
              </div>
              <p className="cardDesc">{cat.descripcion || "Sin descripción"}</p>
              <div className="cardActions">
                <button className="actionIcon btnEdit" onClick={() => setForm({ id_categoria: cat.id_categoria, nombre: cat.nombre, descripcion: cat.descripcion })}>📝</button>
                <button className="actionIcon btnToggle" onClick={() => handleToggleStatus(cat)} title={cat.activo ? "Desactivar" : "Activar"}>
                  {cat.activo ? "🚫" : "✅"}
                </button>
                <button className="actionIcon btnDelete" onClick={() => handleDelete(cat.id_categoria)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
