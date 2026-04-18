"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import "../../clientes/clientes.css";
import "../ventas.css";

type Venta = {
  id_venta: number;
  fecha: string;
  total: number;
  cliente: string;
  vendedor: string;
};

type DetalleItem = {
  id_detalle: number;
  producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export default function HistorialVentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [detalle, setDetalle] = useState<DetalleItem[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    fetchVentas();
  }, []);

  async function fetchVentas() {
    try {
      const res = await fetch("/api/ventas", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setVentas(data.data);
    } catch (err) {
      console.error("Error al cargar ventas", err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const totalVendido = ventas.reduce((acc, v) => acc + v.total, 0);
    return {
      cantidad: ventas.length,
      monto: totalVendido.toFixed(2)
    };
  }, [ventas]);

  async function verDetalle(venta: Venta) {
    setSelectedVenta(venta);
    setLoadingDetalle(true);
    try {
      const res = await fetch(`/api/ventas/${venta.id_venta}`);
      const data = await res.json();
      if (data.ok) setDetalle(data.data);
    } catch (err) {
      alert("Error al cargar detalle");
    } finally {
      setLoadingDetalle(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Historial de Ventas</h1>
          <p>Consulta y auditoría de facturación</p>
        </div>
        <Link href="/ventas" className="btn-save" style={{ textDecoration: 'none' }}>
          + Nueva Venta
        </Link>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="statsRow" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="statCard" style={{ flex: 1, padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '6px solid #2563eb' }}>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Ventas Totales</span>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.cantidad}</h2>
        </div>
        <div className="statCard" style={{ flex: 1, padding: '1.5rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '6px solid #10b981' }}>
          <span style={{ color: '#047857', fontSize: '0.875rem' }}>Monto Acumulado</span>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#065f46' }}>${stats.monto}</h2>
        </div>
      </div>

      <div className="card" style={{ borderLeft: '6px solid #cbd5e1' }}>
        {loading ? <div className="loading">Cargando transacciones...</div> : (
          <table className="table">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th>Folio</th>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id_venta}>
                  <td style={{ color: '#2563eb', fontWeight: 'bold' }}>#{v.id_venta}</td>
                  <td>{new Date(v.fecha).toLocaleString()}</td>
                  <td>{v.cliente}</td>
                  <td>{v.vendedor}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>${v.total.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-edit" onClick={() => verDetalle(v)}>Ver Ticket</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedVenta && (
        <div className="modalOverlay">
          <div className="ticketModal">
            <div className="ticketHeader">
              <h3>ORDEN DE VENTA</h3>
              <p>ID: {selectedVenta.id_venta}</p>
            </div>
            <div className="ticketBody">
              <div className="ticketInfo">
                <p><strong>Fecha:</strong> {new Date(selectedVenta.fecha).toLocaleString()}</p>
                <p><strong>Cliente:</strong> {selectedVenta.cliente}</p>
              </div>
              
              <table className="ticketTable">
                <thead><tr><th>Cant.</th><th>Descripción</th><th>Total</th></tr></thead>
                <tbody>
                  {detalle.map(item => (
                    <tr key={item.id_detalle}>
                      <td>{item.cantidad} x ${Number(item.precio_unitario || 0).toFixed(2)}</td>
                      <td>{item.producto}</td>
                      <td>${Number(item.subtotal || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="ticketTotal" style={{ fontSize: '1.5rem' }}>
                TOTAL: ${selectedVenta.total.toFixed(2)}
              </div>
            </div>
            <div className="ticketFooter">
              <button className="btnClose" onClick={() => setSelectedVenta(null)}>Cerrar</button>
              <button className="btnPrint" onClick={() => window.print()}>Imprimir Copia</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
