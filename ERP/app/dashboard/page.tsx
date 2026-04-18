import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { getDbPool } from "@/lib/db";
import "./dashboard.css";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("erp_session");

  if (!session) {
    redirect("/login");
  }

  let user = null;
  try {
    user = JSON.parse(session.value);
  } catch (e) {
    redirect("/login");
  }

  const pool = await getDbPool();

  // 1. Obtener suma de ventas del día actual
  const resVentas = await pool.request().query("SELECT ISNULL(SUM(total), 0) AS ventasHoy FROM Ventas WHERE CAST(fecha AS DATE) = CAST(GETDATE() AS DATE)");
  const ventasHoy = resVentas.recordset[0]?.ventasHoy || 0;

  // 2. Obtener conteo de clientes registrados el día actual
  const resClientes = await pool.request().query("SELECT COUNT(id_cliente) AS clientesHoy FROM Clientes WHERE CAST(fecha_registro AS DATE) = CAST(GETDATE() AS DATE)");
  const nuevosClientes = resClientes.recordset[0]?.clientesHoy || 0;

  // 3. Obtener alertas de stock (productos en nivel mínimo o por debajo)
  const resStock = await pool.request().query("SELECT COUNT(*) AS alertas FROM Inventario WHERE stock_actual <= stock_minimo");
  const alertasStock = resStock.recordset[0]?.alertas || 0;

  return (
    <div className="dashboardContainer">
      <nav className="navbar">
        <div className="navBrand">Smart Sales ERP</div>
        <div className="userInfo">
          <div className="userProfile">
            <div className="userAvatar">{user?.nombre?.charAt(0).toUpperCase()}</div>
            <div className="userMeta">
              <span className="userName">{user?.nombre}</span>
              <span className="userBadge">{user?.rol}</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <main className="content">
        <header className="pageHeader">
          <h1>Bienvenido al Panel de Control</h1>
          <p>Estado del sistema y acceso rápido a módulos.</p>
        </header>

        <section className="statsGrid">
          <div className="statCard">
            <h3>Ventas Hoy</h3>
            <p className="statValue">${ventasHoy.toFixed(2)}</p>
          </div>
          <div className="statCard">
            <h3>Nuevos Clientes Hoy</h3>
            <p className="statValue">{nuevosClientes}</p>
          </div>
          <div className="statCard">
            <h3>Alertas Stock</h3>
            <p className="statValue">{alertasStock > 0 ? alertasStock : "Al día"}</p>
          </div>
        </section>

        <section className="quickAccess">
          <h2>Acceso Directo</h2>
          <div className="accessGrid">
            <a href="/productos" className="accessItem">📦 Productos</a>
            <a href="/ventas" className="accessItem">🛍️ Nueva Venta</a>
            <a href="/clientes" className="accessItem">👥 Clientes</a>
            <a href="/categorias" className="accessItem">📁 Categorías</a>
            <a href="/inventario" className="accessItem">🏗️ Inventario</a>
            <a href="/reportes" className="accessItem">📊 Reportes</a>
            <a href="/dashboard/perfil" className="accessItem">👤 Mi Perfil</a>
            {user?.rol?.toUpperCase() === "ADMINISTRADOR" && (
              <a href="/dashboard/usuarios" className="accessItem">🛡️ Usuarios</a>
            )}
            {user?.rol?.toUpperCase() === "ADMINISTRADOR" && (
              <a href="/backups" className="accessItem">💾 Backups</a>
            )}
            {user?.rol?.toUpperCase() === "ADMINISTRADOR" && (
              <a href="/predicciones" className="accessItem">🔮 Predicciones</a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
