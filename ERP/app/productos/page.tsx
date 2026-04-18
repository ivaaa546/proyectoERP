"use client";

import { useEffect, useState } from "react";
import "./productos.css";

type Producto = {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  id_categoria: number;
  categoria: string;
  stock_actual: number;
  activo: boolean;
};

type Categoria = {
  id_categoria: number;
  nombre: string;
};

type UserSession = {
  rol: string;
  nombre: string;
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    id_categoria: "",
    stock_inicial: "0",
  });

  useEffect(() => {
    fetchData();
    fetchSession();
  }, []);

  async function fetchSession() {
    const res = await fetch("/api/auth/session");
    const data = await res.json();
    if (data.ok) setSession(data.user);
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("/api/productos", { cache: "no-store" }),
        fetch("/api/categorias", { cache: "no-store" }),
      ]);
      const dataProd = await resProd.json();
      const dataCat = await resCat.json();

      if (dataProd.ok) setProductos(dataProd.data);
      if (dataCat.ok) setCategorias(dataCat.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleEstado(id: number, currentEstado: boolean) {
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !currentEstado }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error toggling state:", error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Está seguro de eliminar este producto definitivamente?")) return;

    try {
      const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setMessage({ text: "Producto eliminado", type: "success" });
        fetchData();
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error al eliminar", type: "error" });
    }
  }

  function handleEdit(prod: Producto) {
    setEditingId(prod.id_producto);
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion || "",
      precio: prod.precio.toString(),
      id_categoria: prod.id_categoria.toString(),
      stock_inicial: prod.stock_actual.toString(),
    });
    setShowModal(true);
  }

  function handleAdd() {
    setEditingId(null);
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      id_categoria: "",
      stock_inicial: "0",
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const url = editingId ? `/api/productos/${editingId}` : "/api/productos";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.ok) {
        setMessage({ text: `Producto ${editingId ? "actualizado" : "creado"} con éxito`, type: "success" });
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
    <div className="productosContainer">
      <header className="pageHeader">
        <div className="headerLeft">
          <h1>Gestión de Productos</h1>
          <p>Catálogo completo e inventario</p>
        </div>
        <button className="addBtn" onClick={handleAdd}>+ Nuevo Producto</button>
      </header>

      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="closeAlert">×</button>
        </div>
      )}

      <div className="tableWrapper">
        {loading ? (
          <div className="loadingState">Cargando catálogo...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.id_producto} className={!prod.activo ? "rowInactive" : ""}>
                  <td>
                    <span className={`statusDot ${prod.activo ? "active" : "inactive"}`}></span>
                  </td>
                  <td>
                    <div className="prodName">{prod.nombre}</div>
                    <div className="prodDesc">{prod.descripcion}</div>
                  </td>
                  <td><span className="catBadge">{prod.categoria}</span></td>
                  <td>${prod.precio.toFixed(2)}</td>
                  <td>
                    <span className={`stockValue ${prod.stock_actual < 5 ? "lowStock" : ""}`}>
                      {prod.stock_actual}
                    </span>
                  </td>
                  <td>
                    <div className="actionButtons">
                      <button className="editBtn" onClick={() => handleEdit(prod)}>Editar</button>
                      
                      <button 
                        className={`toggleBtn ${prod.activo ? "btnDesactivar" : "btnActivar"}`}
                        onClick={() => handleToggleEstado(prod.id_producto, prod.activo)}
                      >
                        {prod.activo ? "Desactivar" : "Activar"}
                      </button>

                      {session?.rol === "Administrador" && (
                        <button className="deleteBtn" onClick={() => handleDelete(prod.id_producto)}>
                          Eliminar
                        </button>
                      )}
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
            <h2>{editingId ? "Editar Producto" : "Nuevo Producto"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="formGroup">
                <label>Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div className="formGroup">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
              <div className="row">
                <div className="formGroup">
                  <label>Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  />
                </div>
                <div className="formGroup">
                  <label>Categoría</label>
                  <select
                    required
                    value={formData.id_categoria}
                    onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                  >
                    <option value="">Seleccione...</option>
                    {categorias.map((cat) => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {!editingId && (
                <div className="formGroup">
                  <label>Stock Inicial</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_inicial}
                    onChange={(e) => setFormData({ ...formData, stock_inicial: e.target.value })}
                  />
                </div>
              )}

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
