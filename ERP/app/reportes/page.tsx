"use client";

import { useState } from "react";
import "./reportes.css";

const reportesMenu = [
  {
    id: "ventas_categoria",
    titulo: "Ventas por Categoría",
    descripcion: "Muestra el total vendido, volumen de transacciones y el porcentaje que representa cada categoría del gran total.",
    icon: "🛒"
  },
  {
    id: "clientes_vip",
    titulo: "Clientes VIP",
    descripcion: "Lista de clientes estrella que han gastado más que el promedio histórico de todos los clientes combinados.",
    icon: "⭐"
  },
  {
    id: "jerarquico",
    titulo: "Jerarquía de Productos",
    descripcion: "Estructura completa de Categoría -> Producto con detalle de veces vendido y total de unidades desplazadas.",
    icon: "📦"
  },
  {
    id: "ventas_tiempo",
    titulo: "Evolución de Ventas",
    descripcion: "Línea de tiempo de ventas organizada por año, mes y día, mostrando cantidades de transacciones e ingresos generados.",
    icon: "📅"
  }
];

export default function ReportesPage() {
  const [modalData, setModalData] = useState<{ tipo: string; titulo: string; data: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function openPreview(id: string, titulo: string) {
    setLoading(true);
    setModalData({ tipo: id, titulo, data: [] });
    try {
      const res = await fetch(`/api/reportes?tipo=${id}`);
      const json = await res.json();
      if (json.ok) {
        setModalData({ tipo: id, titulo, data: json.data });
      } else {
        alert("Error al cargar reporte: " + json.message);
        setModalData(null);
      }
    } catch (err) {
      alert("Fallo la conexión con el servidor.");
      setModalData(null);
    } finally {
      setLoading(false);
    }
  }

  function closePreview() {
    setModalData(null);
  }

  return (
    <div className="reportesContainer">
      <header className="reportesHeader">
        <h1>📊 Centro de Reportes Avanzados</h1>
        <p>Análisis de datos, inteligencia de negocios y exportación.</p>
      </header>

      <div className="cardGrid">
        {reportesMenu.map((rep) => (
          <div className="reportCard" key={rep.id}>
            <h2><span>{rep.icon}</span> {rep.titulo}</h2>
            <p>{rep.descripcion}</p>
            <div className="actionGroup">
              <button 
                className="btn btn-preview" 
                onClick={() => openPreview(rep.id, rep.titulo)}
              >
                👁️ Vista Previa
              </button>
              <a 
                href={`/api/reportes/pdf?tipo=${rep.id}`} 
                target="_blank" 
                className="btn btn-primary"
              >
                📄 PDF
              </a>
              <a 
                href={`/api/reportes/excel?tipo=${rep.id}`} 
                className="btn btn-secondary"
                download
              >
                📥 Excel (CSV)
              </a>
            </div>
          </div>
        ))}
      </div>

      {modalData && (
        <div className="modalOverlay" onClick={closePreview}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>Vista Previa: {modalData.titulo}</h2>
              <button className="closeBtn" onClick={closePreview}>&times;</button>
            </div>
            <div className="modalBody">
              {loading ? (
                <div className="loadingWrapper">Generando reporte, por favor espere...</div>
              ) : modalData.data.length === 0 ? (
                <div className="loadingWrapper">El reporte no contiene datos actualmente.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="dataTable">
                    <thead>
                      <tr>
                        {Object.keys(modalData.data[0]).map((key) => (
                          <th key={key}>{key.toUpperCase()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.data.map((row, i) => (
                        <tr key={i}>
                          {Object.keys(row).map((key, j) => (
                            <td key={j}>{row[key] !== null ? row[key] : "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modalHeader" style={{ borderTop: "1px solid #1e293b", borderBottom: "none", justifyContent: "flex-end" }}>
              <a 
                href={`/api/reportes/pdf?tipo=${modalData.tipo}`} 
                target="_blank" 
                className="btn btn-primary"
              >
                Imprimir PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
