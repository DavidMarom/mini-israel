"use client";

import { useState } from "react";

export default function AdminPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReseed = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/reseed-apples", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setStatus(`✅ Seeded ${data.apples} apples. Refresh the board to see them.`);
      } else {
        setStatus("❌ Error: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      setStatus("❌ Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Admin</h1>
      <hr />
      <h2>Board</h2>
      <button onClick={handleReseed} disabled={loading} style={{ padding: "8px 20px", cursor: "pointer" }}>
        {loading ? "Seeding…" : "🍎 Reseed Apples"}
      </button>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}
