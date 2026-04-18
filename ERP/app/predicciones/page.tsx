"use client";

import { useEffect, useState } from "react";
import "./predicciones.css";

interface Observacion {
  fecha: string;
  valor: number;
}

interface PrediccionPoint {
  fecha: string;
  valor_predicho: number;
}

interface Producto {
  id_producto: number;
  nombre: string;
}

export default function PrediccionesPage() {
  const [tipoPrediccion, setTipoPrediccion] = useState<"producto" | "ventas_totales">("ventas_totales");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [idProducto, setIdProducto] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [horizonte, setHorizonte] = useState<number>(30);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [resultado, setResultado] = useState<PrediccionPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    try {
      const res = await fetch("/api/productos", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setProductos(data.data);
      }
    } catch (err) {
      console.error("Error fetching productos:", err);
    }
  }

  async function cargarHistorial() {
    if (!fechaInicio || !fechaFin) {
      setError("Debe seleccionar fecha inicio y fecha fin.");
      return;
    }

    if (tipoPrediccion === "producto" && !idProducto) {
      setError("Debe seleccionar un producto.");
      return;
    }

    setLoadingHistorial(true);
    setError(null);
    setSuccess(null);

    try {
      const params = new URLSearchParams({
        tipo: tipoPrediccion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });

      if (tipoPrediccion === "producto" && idProducto) {
        params.append("id_producto", idProducto);
      }

      const res = await fetch(`/api/predicciones/historial?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.ok) {
        if (json.data.length < 14) {
          setError(`Se encontraron ${json.data.length} datos. Se requieren al menos 14 para entrenar el modelo.`);
          setObservaciones([]);
        } else {
          setObservaciones(json.data);
          setSuccess(`Se cargaron ${json.data.length} registros históricos.`);
        }
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError("Error al cargar datos históricos.");
    } finally {
      setLoadingHistorial(false);
    }
  }

  async function generarPrediccion() {
    if (observaciones.length < 14) {
      setError("Cargue al menos 14 datos históricos antes de predecir.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        tipo: tipoPrediccion,
        id_producto: tipoPrediccion === "producto" ? parseInt(idProducto) : 1,
        horizonte_dias: horizonte,
        observaciones,
      };

      const res = await fetch("/api/predicciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.ok) {
        setResultado(json.data.predicciones);
        setSuccess("Predicción generada exitosamente.");
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  const exportarCSV = () => {
    if (!resultado) return;
    const headers = ["Fecha", "Valor Predicho"];
    const rows = resultado.map(p => [p.fecha, p.valor_predicho.toFixed(2)]);
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `prediccion_${tipoPrediccion}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    window.print();
  };

  return (
    <div className="prediccionesContainer">
      <header className="pageHeader no-print">
        <h1>Módulo de Análisis Predictivo</h1>
      </header>

      {error && (
        <div className="alert error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {success && (
        <div className="alert success">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess(null)}>&times;</button>
        </div>
      )}

      <div className="card no-print">
        <h2>Configuración</h2>
        <div className="formGrid">
          <div className="formGroup">
            <label>Tipo de Predicción</label>
            <select
              value={tipoPrediccion}
              onChange={(e) => {
                setTipoPrediccion(e.target.value as any);
                setResultado(null);
                setObservaciones([]);
                setSuccess(null);
              }}
            >
              <option value="ventas_totales">Ventas totales del mes</option>
              <option value="producto">Por Producto específico</option>
            </select>
          </div>

          {tipoPrediccion === "producto" && (
            <div className="formGroup">
              <label>Producto</label>
              <select
                value={idProducto}
                onChange={(e) => setIdProducto(e.target.value)}
              >
                <option value="">Seleccionar producto...</option>
                {productos.map((p) => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="formGroup">
            <label>Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label>Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label>Días a Predecir</label>
            <input
              type="number"
              min="1"
              max="365"
              value={horizonte}
              onChange={(e) => setHorizonte(parseInt(e.target.value))}
            />
          </div>
        </div>

        <button
          className="btnSecondary"
          onClick={cargarHistorial}
          disabled={loadingHistorial}
          style={{ marginRight: "1rem" }}
        >
          {loadingHistorial ? "Cargando..." : "📥 Cargar Datos Históricos"}
        </button>

        <button
          className="btnPrimary"
          onClick={generarPrediccion}
          disabled={loading || observaciones.length < 14}
        >
          {loading ? "Procesando módulos ML..." : "🚀 Generar Predicción"}
        </button>
      </div>

      {observaciones.length > 0 && (
        <div className="card">
          <h2>Datos Históricos Cargados ({observaciones.length} registros)</h2>
          <div className="tableWrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {observaciones.map((obs, i) => (
                  <tr key={i}>
                    <td>{obs.fecha}</td>
                    <td>{obs.valor.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resultado && (
        <div className="card resultCard">
          <div className="resultsHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Resultados de la Predicción</h2>
            <div className="exportActions no-print" style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btnExport btnCSV" onClick={exportarCSV} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.625rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                📥 Exportar CSV
              </button>
              <button className="btnExport btnPDF" onClick={exportarPDF} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.625rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                📄 Imprimir PDF
              </button>
            </div>
          </div>
          <div className="resultsGrid">
            <div className="tableWrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Valor Predicho</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.map((p, i) => (
                    <tr key={i}>
                      <td>{p.fecha}</td>
                      <td><strong>{p.valor_predicho.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="chartContainer">
              <h3>Gráfico de Tendencia</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px', padding: '20px 0' }}>
                {resultado.map((p, i) => {
                  const maxVal = Math.max(...resultado.map(x => x.valor_predicho), 1);
                  const height = (p.valor_predicho / maxVal) * 100;
                  return (
                    <div 
                      key={i} 
                      title={`${p.fecha}: ${p.valor_predicho.toFixed(2)}`}
                      style={{ 
                        flex: 1, 
                        backgroundColor: '#2563eb', 
                        height: `${height}%`,
                        borderRadius: '2px 2px 0 0',
                        minWidth: '5px'
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                <span>{resultado[0].fecha}</span>
                <span>{resultado[Math.floor(resultado.length / 2)].fecha}</span>
                <span>{resultado[resultado.length - 1].fecha}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}