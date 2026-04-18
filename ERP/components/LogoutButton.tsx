"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleLogout} 
      className="logoutBtn"
      disabled={loading}
    >
      {loading ? "Saliendo..." : "Cerrar Sesión"}
    </button>
  );
}
