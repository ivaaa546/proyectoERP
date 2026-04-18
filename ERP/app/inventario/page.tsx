"use client";

import { useEffect, useState } from "react";
import "./inventario.css";

type Producto = {
  id_producto: number;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  categoria: string;
};

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [newMinStock, setNewMinStock] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    try {
      setLoading(true);
      const res = await fetch("/api/inventario");
      const data = await res.json();
      if (data.ok) setProductos(data.data);
    } catch (err) {
      console.error("Error cargando productos", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = productos.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) || 
    p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  function openAdjustModal(p: Producto) {
    setSelectedProducto(p);
    setNewStock(p.stock_actual);
    setNewMinStock(p.stock_minimo);
  }

  async function handleUpdateStock() {
    if (!selectedProducto) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/inventario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id_producto: selectedProducto.id_producto, 
          nueva_cantidad: newStock,
          nuevo_minimo: newMinStock
        })
      });

      const data = await res.json();
      if (data.ok) {
        setProductos(prev => prev.map(p => 
          p.id_producto === selectedProducto.id_producto ? { ...p, stock_actual: newStock, stock_minimo: newMinStock } : p
        ));
        setSelectedProducto(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error al actualizar stock");
    } finally {
      setSubmitting(false);
    }
  }

  const getStockClass = (count: number, min: number) => {
    if (count <= min) return "stock-low";
    if (count <= min + 10) return "stock-medium";
    return "stock-high";
  };

  return (
    <div className="inventoryContainer">
      <header className="inventoryHeader">
        <h1>Gestión de Inventario</h1>
        <input 
          type="text" 
          placeholder="Buscar producto o categoría..." 
          className="searchBox"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {loading ? <p>Cargando inventario...</p> : (
        <table className="inventoryTable">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id_producto}>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td style={{ fontWeight: 'bold' }}>{p.stock_actual}</td>
                <td style={{ color: '#64748b' }}>{p.stock_minimo}</td>
                <td>
                  <span className={`stockBadge ${getStockClass(p.stock_actual, p.stock_minimo)}`}>
                    {p.stock_actual <= p.stock_minimo ? "Reabastecer" : "Ok"}
                  </span>
                </td>
                <td>
                  <button className="actionBtn adjustBtn" onClick={() => openAdjustModal(p)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedProducto && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>Editar Niveles de Inventario</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Producto: <strong>{selectedProducto.nombre}</strong>
            </p>
            
            <div className="inputGroup">
              <label>Cantidad Actual</label>
              <input 
                type="number" 
                value={newStock} 
                onChange={(e) => setNewStock(parseInt(e.target.value))}
                autoFocus
              />
            </div>

            <div className="inputGroup">
              <label>Stock Mínimo (Alerta)</label>
              <input 
                type="number" 
                value={newMinStock} 
                onChange={(e) => setNewMinStock(parseInt(e.target.value))}
              />
            </div>

            <div className="modalActions">
              <button className="actionBtn cancelBtn" onClick={() => setSelectedProducto(null)}>
                Cancelar
              </button>
              <button 
                className="actionBtn confirmBtn" 
                disabled={submitting}
                onClick={handleUpdateStock}
              >
                {submitting ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
