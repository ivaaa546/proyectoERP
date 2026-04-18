import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "ERP Ventas Inteligente",
  description: "Sistema ERP con SQL Server, reportes y analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
