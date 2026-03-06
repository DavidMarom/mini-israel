"use client";

import { useState } from "react";
import AdminPage from "./AdminPage";

const PASSWORD = "qwerty78";

export default function AdminGate() {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === PASSWORD) {
      setUnlocked(true);
    } else {
      setError(true);
      setInput("");
    }
  };

  if (unlocked) return <AdminPage />;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#111", fontFamily: "sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#1e1e1e", padding: "40px 48px", borderRadius: 16,
        display: "flex", flexDirection: "column", gap: 16, minWidth: 300,
        border: "1px solid #333",
      }}>
        <h2 style={{ margin: 0, color: "#fff", textAlign: "center" }}>Admin</h2>
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          placeholder="סיסמה"
          autoFocus
          style={{
            padding: "10px 14px", borderRadius: 8, fontSize: 16,
            border: error ? "1px solid #f87171" : "1px solid #444",
            background: "#2a2a2a", color: "#fff", outline: "none", direction: "rtl",
          }}
        />
        {error && <p style={{ margin: 0, color: "#f87171", fontSize: 13, textAlign: "center" }}>סיסמה שגויה</p>}
        <button type="submit" style={{
          padding: "10px", background: "#394a75", color: "#fff", border: "none",
          borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer",
        }}>
          כניסה
        </button>
      </form>
    </div>
  );
}
