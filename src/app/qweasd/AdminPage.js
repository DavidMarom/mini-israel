"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orangeLoading, setOrangeLoading] = useState(false);

  // ── Board ────────────────────────────────────────────
  const handleReseed = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/reseed-apples", { method: "POST" });
      const data = await res.json();
      setStatus(data.ok ? `✅ Seeded ${data.apples} apples.` : "❌ Error: " + (data.error || "Unknown error"));
    } catch (e) {
      setStatus("❌ Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReseedOranges = async () => {
    setOrangeLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/reseed-oranges", { method: "POST" });
      const data = await res.json();
      setStatus(data.ok ? `✅ Seeded ${data.oranges} oranges.` : "❌ Error: " + (data.error || "Unknown error"));
    } catch (e) {
      setStatus("❌ Request failed");
    } finally {
      setOrangeLoading(false);
    }
  };

  // ── Taglines ─────────────────────────────────────────
  const [taglines, setTaglines] = useState([]);
  const [taglinesLoading, setTaglinesLoading] = useState(true);
  const [taglinesSaving, setTaglinesSaving] = useState(false);

  const loadTaglines = async () => {
    setTaglinesLoading(true);
    try {
      const res = await fetch("/api/admin/taglines");
      const data = await res.json();
      if (Array.isArray(data.taglines)) setTaglines(data.taglines);
    } catch (e) { console.error(e); } finally { setTaglinesLoading(false); }
  };

  const saveTaglines = async () => {
    setTaglinesSaving(true);
    try {
      await fetch("/api/admin/taglines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taglines }),
      });
    } catch (e) { console.error(e); } finally { setTaglinesSaving(false); }
  };

  // ── Ads ──────────────────────────────────────────────
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [adDeleting, setAdDeleting] = useState(null);

  const loadAds = async () => {
    setAdsLoading(true);
    try {
      const res = await fetch("/api/admin/ads");
      const data = await res.json();
      if (Array.isArray(data.ads)) setAds(data.ads);
    } catch (e) { console.error(e); } finally { setAdsLoading(false); }
  };

  const deleteAd = async (id) => {
    setAdDeleting(id);
    try {
      await fetch("/api/ads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setAds((prev) => prev.filter((a) => String(a._id) !== id));
    } catch (e) { console.error(e); } finally { setAdDeleting(null); }
  };

  // ── Users ─────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) { console.error(e); } finally { setUsersLoading(false); }
  };

  const handleUserAction = async (uid, action) => {
    setActionLoading(uid);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => u.uid === uid ? { ...u, suspended: action === "suspend" } : u)
        );
      }
    } catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

  useEffect(() => {
    loadUsers();
    loadTaglines();
    loadAds();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", direction: "rtl" }}>
      <h1>Admin</h1>
      <hr />

      {/* ── Board ── */}
      <h2>לוח</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={handleReseed} disabled={loading} style={{ padding: "8px 20px", cursor: "pointer" }}>
          {loading ? "Seeding…" : "🍎 Reseed Apples"}
        </button>
        <button onClick={handleReseedOranges} disabled={orangeLoading} style={{ padding: "8px 20px", cursor: "pointer" }}>
          {orangeLoading ? "Seeding…" : "🍊 Reseed Oranges"}
        </button>
      </div>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}

      <hr style={{ margin: "32px 0" }} />

      {/* ── Taglines ── */}
      <h2>הודעות צהובות</h2>
      {taglinesLoading ? <p>טוען...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 600 }}>
          {taglines.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={t}
                onChange={(e) => setTaglines((prev) => prev.map((v, j) => j === i ? e.target.value : v))}
                style={{ flex: 1, padding: "6px 10px", fontSize: 14, direction: "rtl", borderRadius: 6, border: "1px solid #ccc" }}
              />
              <button
                onClick={() => setTaglines((prev) => prev.filter((_, j) => j !== i))}
                style={{ ...actionBtn, background: "#dc2626" }}
              >
                מחק
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={() => setTaglines((prev) => [...prev, ""])} style={{ padding: "6px 14px", cursor: "pointer" }}>
              + הוסף הודעה
            </button>
            <button onClick={saveTaglines} disabled={taglinesSaving} style={{ padding: "6px 14px", cursor: "pointer", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6 }}>
              {taglinesSaving ? "שומר..." : "שמור"}
            </button>
          </div>
        </div>
      )}

      <hr style={{ margin: "32px 0" }} />

      {/* ── Ads ── */}
      <h2>פרסומות</h2>
      <button onClick={loadAds} disabled={adsLoading} style={{ marginBottom: 16, padding: "6px 16px", cursor: "pointer" }}>
        {adsLoading ? "טוען..." : "רענן"}
      </button>
      {adsLoading ? <p>טוען פרסומות...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "right" }}>
              <th style={th}>טקסט</th>
              <th style={th}>מפרסם (uid)</th>
              <th style={th}>נוצר</th>
              <th style={th}>פג תוקף</th>
              <th style={th}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((a) => {
              const id = String(a._id);
              const expired = new Date(a.expiresAt) < new Date();
              return (
                <tr key={id} style={{ borderBottom: "1px solid #ddd", background: expired ? "#f9f9f9" : "white" }}>
                  <td style={{ ...td, maxWidth: 300, wordBreak: "break-word" }}>{a.text}</td>
                  <td style={{ ...td, fontSize: 11, color: "#666" }}>{a.uid}</td>
                  <td style={td}>{new Date(a.createdAt).toLocaleDateString("he-IL")}</td>
                  <td style={{ ...td, color: expired ? "#c00" : "#080" }}>
                    {new Date(a.expiresAt).toLocaleDateString("he-IL")}
                    {expired && " (פג)"}
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => deleteAd(id)}
                      disabled={adDeleting === id}
                      style={{ ...actionBtn, background: "#dc2626" }}
                    >
                      {adDeleting === id ? "..." : "מחק"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <hr style={{ margin: "32px 0" }} />

      {/* ── Users ── */}
      <h2>משתמשים</h2>
      <button onClick={loadUsers} disabled={usersLoading} style={{ marginBottom: 16, padding: "6px 16px", cursor: "pointer" }}>
        {usersLoading ? "טוען..." : "רענן"}
      </button>
      {usersLoading ? <p>טוען משתמשים...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "right" }}>
              <th style={th}>שם</th>
              <th style={th}>אימייל</th>
              <th style={th}>מטבעות</th>
              <th style={th}>נרשם</th>
              <th style={th}>סטטוס</th>
              <th style={th}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} style={{ borderBottom: "1px solid #ddd", background: u.suspended ? "#fff0f0" : "white" }}>
                <td style={td}>{u.name || "—"}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>{u.money ?? 0}</td>
                <td style={td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("he-IL") : "—"}</td>
                <td style={td}>
                  {u.suspended
                    ? <span style={{ color: "#c00", fontWeight: 600 }}>מושעה</span>
                    : <span style={{ color: "#080" }}>פעיל</span>}
                </td>
                <td style={td}>
                  {u.suspended ? (
                    <button onClick={() => handleUserAction(u.uid, "unsuspend")} disabled={actionLoading === u.uid} style={{ ...actionBtn, background: "#2563eb" }}>
                      {actionLoading === u.uid ? "..." : "בטל השעיה"}
                    </button>
                  ) : (
                    <button onClick={() => handleUserAction(u.uid, "suspend")} disabled={actionLoading === u.uid} style={{ ...actionBtn, background: "#dc2626" }}>
                      {actionLoading === u.uid ? "..." : "השעה"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { padding: "10px 12px", borderBottom: "2px solid #ccc", fontWeight: 700 };
const td = { padding: "10px 12px" };
const actionBtn = { color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 13 };
