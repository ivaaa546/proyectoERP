"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import "./ventas.css";

type Producto = {
  id_producto: number;
  nombre: string;
  precio: number;
  stock_actual: number;
  stock_minimo: number;
  categoria: string;
  activo: boolean;
};

type Cliente = {
  id_cliente: number;
  nombres: string;
  apellidos: string;
  activo: boolean;
};

type CartItem = {
  id_producto: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock_disponible: number;
};

type TicketData = {
  id_venta?: number;
  cliente: string;
  vendedor: string;
  fecha: string;
  total: number;
  iva: number;
  subtotal: number;
  items: CartItem[];
  esBorrador: boolean;
};

export default function VentasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [search, setSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // Estados para nuevo cliente rápido (Añadido teléfono)
  const [showQuickClient, setShowQuickClient] = useState(false);
  const [newClient, setNewClient] = useState({ 
    nombres: "", 
    apellidos: "", 
    documento_identidad: "",
    telefono: "" 
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [resProd, resCli] = await Promise.all([
        fetch("/api/productos", { cache: "no-store" }),
        fetch("/api/clientes", { cache: "no-store" }),
      ]);
      const dataProd = await resProd.json();
      const dataCli = await resCli.json();

      if (dataProd.ok) setProductos(dataProd.data.filter((p: Producto) => p.activo));
      if (dataCli.ok) setClientes(dataCli.data.filter((c: Cliente) => c.activo));
    } catch (err) {
      console.error("Error al cargar datos", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = useMemo(() => {
    return clientes.filter(c => 
      `${c.nombres} ${c.apellidos}`.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clientes, clientSearch]);

  const filteredProducts = productos.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) || 
    p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const subtotalNeto = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);
  }, [cart]);

  const ivaCalculado = subtotalNeto * 0.12;
  const totalConImpuestos = subtotalNeto + ivaCalculado;

  function addToCart(prod: Producto) {
    if (prod.stock_actual <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id_producto === prod.id_producto);
      if (existing) {
        if (existing.cantidad >= prod.stock_actual) return prev;
        return prev.map(item => item.id_producto === prod.id_producto ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { id_producto: prod.id_producto, nombre: prod.nombre, precio_unitario: prod.precio, cantidad: 1, stock_disponible: prod.stock_actual }];
    });
  }

  function updateQty(id: number, qty: number) {
    setCart(prev => prev.map(item => {
      if (item.id_producto === id) {
        const newQty = Math.max(1, Math.min(qty, item.stock_disponible));
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  }

  function removeFromCart(id: number) {
    setCart(prev => prev.filter(item => item.id_producto !== id));
  }

  function handleRevisarVenta() {
    if (!selectedCliente || cart.length === 0) return;
    const cliInfo = clientes.find(c => c.id_cliente === parseInt(selectedCliente));
    setTicketData({
      cliente: `${cliInfo?.nombres} ${cliInfo?.apellidos}`,
      vendedor: "Vendedor de Turno",
      fecha: new Date().toLocaleString(),
      subtotal: subtotalNeto,
      iva: ivaCalculado,
      total: totalConImpuestos,
      items: [...cart],
      esBorrador: true
    });
    setShowTicket(true);
  }

  async function handleConfirmarRegistro() {
    try {
      setLoading(true);
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: parseInt(selectedCliente),
          detalles: cart.map(item => ({ id_producto: item.id_producto, cantidad: item.cantidad, precio_unitario: item.precio_unitario }))
        })
      });

      const data = await res.json();
      if (data.ok) {
        setTicketData(prev => prev ? ({ 
          ...prev, 
          id_venta: data.data.id_venta, 
          total: data.data.total,
          iva: data.data.total * (0.12/1.12),
          subtotal: data.data.total / 1.12,
          esBorrador: false 
        }) : null);
        setCart([]);
        setSelectedCliente("");
        fetchData();
        setMessage({ text: "Venta registrada", type: "success" });
        setTimeout(() => setMessage(null), 5000);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveQuickClient() {
    if (!newClient.nombres || !newClient.apellidos) return;
    try {
      setLoading(true);
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient)
      });
      const data = await res.json();
      if (data.ok) {
        await fetchData();
        setSelectedCliente(data.data.id_cliente.toString());
        setShowQuickClient(false);
        setNewClient({ nombres: "", apellidos: "", documento_identidad: "", telefono: "" });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error al crear cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="posContainer">
      <div className="cartSection">
        <header className="cartHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h2>Punto de Venta</h2>
            <div className="clientSelector">
              <input 
                type="text" 
                placeholder="🔍 Buscar cliente..." 
                className="clientSearchInput"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
              <div className="clientSelectGroup">
                <select 
                  value={selectedCliente} 
                  onChange={(e) => setSelectedCliente(e.target.value)}
                >
                  <option value="">-- {clientSearch ? 'Resultados' : 'Seleccionar Cliente'} --</option>
                  {filteredClients.map(cli => (
                    <option key={cli.id_cliente} value={cli.id_cliente}>{cli.nombres} {cli.apellidos}</option>
                  ))}
                </select>
                <button 
                  className="checkoutBtn"
                  title="Nuevo Cliente Rápido"
                  onClick={() => setShowQuickClient(true)}
                  style={{ width: '45px', padding: '0.6rem', fontSize: '1.2rem' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <Link href="/ventas/historial" className="btn-history">Ver Historial</Link>
        </header>

        <main className="cartItems">
          {cart.length === 0 ? <div className="emptyCart"><p>Seleccione productos</p></div> : (
            <table className="cartTable">
              <thead><tr><th>Producto</th><th>Cant.</th><th>Total</th><th></th></tr></thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id_producto}>
                    <td>{item.nombre}</td>
                    <td><input type="number" className="qtyInput" disabled={loading} value={item.cantidad} onChange={(e) => updateQty(item.id_producto, parseInt(e.target.value))} /></td>
                    <td>${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                    <td><button className="removeItem" onClick={() => removeFromCart(item.id_producto)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>

        <footer className="cartFooter">
          <div className="totalRow"><span className="totalLabel">Total Real</span><span className="totalValue">${totalConImpuestos.toFixed(2)}</span></div>
          <button className="checkoutBtn" disabled={cart.length === 0 || !selectedCliente || loading} onClick={handleRevisarVenta}>
            REVISAR VENTA
          </button>
        </footer>
      </div>

      <div className="productSection">
        <div className="searchBox"><input type="text" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="productList">
          {filteredProducts.map(prod => (
            <div key={prod.id_producto} className={`productCard ${prod.stock_actual === 0 ? "outOfStock" : ""}`} onClick={() => addToCart(prod)}>
              <div className="prodInfo">
                <h4>{prod.nombre}</h4>
                <p>
                  {prod.categoria} | 
                  <span className={`stockTag ${prod.stock_actual <= prod.stock_minimo ? "low" : ""}`}>
                    Stock: {prod.stock_actual}
                  </span>
                </p>
              </div>
              <div className="prodMeta"><span className="priceTag">${prod.precio.toFixed(2)}</span></div>
            </div>
          ))}
        </div>
      </div>

      {showTicket && ticketData && (
        <div className="modalOverlay">
          <div className="ticketModal">
            {ticketData.esBorrador && <div className="draftBadge">VISTA PREVIA</div>}
            <div className="ticketHeader"><h3>{ticketData.esBorrador ? "REVISIÓN" : "ORDEN DE VENTA"}</h3></div>
            <div className="ticketBody">
              <p><strong>Cliente:</strong> {ticketData.cliente}</p>
              <table className="ticketTable">
                <tbody>
                  {ticketData.items.map(item => (
                    <tr key={item.id_producto}><td>{item.cantidad} x {item.nombre}</td><td style={{textAlign: 'right'}}>${(item.cantidad * item.precio_unitario).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="ticketTotal">TOTAL: ${ticketData.total.toFixed(2)}</div>
            </div>
            <div className="ticketFooter">
              {ticketData.esBorrador ? (
                <><button className="btnClose" onClick={() => setShowTicket(false)}>Cancelar</button><button className="btnPrint" onClick={handleConfirmarRegistro}>REGISTRAR VENTA</button></>
              ) : (
                <><button className="btnClose" onClick={() => setShowTicket(false)}>Cerrar</button><button className="btnPrint" onClick={() => window.print()}>Imprimir</button></>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLIENTE RAPIDO (CON TELEFONO) */}
      {showQuickClient && (
        <div className="modalOverlay">
          <div className="ticketModal" style={{ fontFamily: 'Inter', borderRadius: '16px' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Socio/Cliente Nuevo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Nombres *</label>
                <input type="text" className="qtyInput" style={{ width: '100%', textAlign: 'left' }} value={newClient.nombres} onChange={(e) => setNewClient({...newClient, nombres: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Apellidos *</label>
                <input type="text" className="qtyInput" style={{ width: '100%', textAlign: 'left' }} value={newClient.apellidos} onChange={(e) => setNewClient({...newClient, apellidos: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Teléfono</label>
                  <input type="text" className="qtyInput" style={{ width: '100%', textAlign: 'left' }} value={newClient.telefono} onChange={(e) => setNewClient({...newClient, telefono: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748b' }}>DNI / NIT</label>
                  <input type="text" className="qtyInput" style={{ width: '100%', textAlign: 'left' }} value={newClient.documento_identidad} onChange={(e) => setNewClient({...newClient, documento_identidad: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="ticketFooter" style={{ marginTop: '2rem' }}>
              <button className="btnClose" onClick={() => setShowQuickClient(false)}>Cerrar</button>
              <button className="btnPrint" onClick={handleSaveQuickClient} disabled={loading}>{loading ? "Guardando..." : "Guardar Cliente"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
