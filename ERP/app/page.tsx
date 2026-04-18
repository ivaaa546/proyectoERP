import Link from "next/link";
import "./landing.css";

export default function HomePage() {
  return (
    <main className="landingContainer">
      <div className="heroContent">
        <span className="badge">Proyecto Final - Base de Datos II</span>
        <h1 className="heroTitle">
          Smart Sales <br /> 
          ERP System
        </h1>
        <p className="heroSubtitle">
          Una plataforma integral diseñada para la gestión inteligente de inventarios, 
          ventas y análisis predictivo basado en Machine Learning.
        </p>

        <div className="ctaGroup">
          <Link href="/login" className="btnLanding btnPrimary">
            🚀 Iniciar Sesión
          </Link>
          <Link href="/dashboard" className="btnLanding btnOutline">
            📊 Ir al Panel
          </Link>
        </div>

        <div className="featuresGrid">
          <div className="featureCard">
            <span className="featureIcon">📦</span>
            <h3 className="featureTitle">Gestión de Inventario</h3>
            <p className="featureText">Control total de existencias, categorías y alertas de stock mínimo en tiempo real.</p>
          </div>
          <div className="featureCard">
            <span className="featureIcon">🛍️</span>
            <h3 className="featureTitle">Punto de Venta</h3>
            <p className="featureText">Interfaz optimizada para transacciones rápidas con integración de base de datos relacional.</p>
          </div>
          <div className="featureCard">
            <span className="featureIcon">🔮</span>
            <h3 className="featureTitle">Predicciones ML</h3>
            <p className="featureText">Módulo persistente de predicción de demanda utilizando modelos de Random Forest.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
