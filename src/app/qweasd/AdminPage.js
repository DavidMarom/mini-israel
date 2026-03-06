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
  // ── Treasure Drop ────────────────────────────────────
  const [treasureRow, setTreasureRow] = useState("");
  const [treasureCol, setTreasureCol] = useState("");
  const [treasureSponsor, setTreasureSponsor] = useState("");
  const [treasureLoading, setTreasureLoading] = useState(false);

  const handleDropTreasure = async () => {
    setTreasureLoading(true);
    setStatus(null);
    try {
      const body = { sponsor: treasureSponsor || undefined };
      if (treasureRow !== "") body.row = Number(treasureRow);
      if (treasureCol !== "") body.col = Number(treasureCol);
      const res = await fetch("/api/admin/treasure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setStatus(data.ok ? `✅ אוצר הוטל בשורה ${data.row}, עמודה ${data.col}` : "❌ שגיאה");
    } catch (e) {
      setStatus("❌ Request failed");
    } finally {
      setTreasureLoading(false);
    }
  };

  // ── Star House ───────────────────────────────────────
  const [starUid, setStarUid] = useState("");
  const [starSponsor, setStarSponsor] = useState("");
  const [starLoading, setStarLoading] = useState(false);

  const handleSetStarHouse = async () => {
    if (!starUid.trim()) return;
    setStarLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/star-house", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: starUid.trim(), sponsor: starSponsor || undefined }),
      });
      const data = await res.json();
      setStatus(data.ok ? `✅ בית השבוע: ${data.name}` : `❌ ${data.error || "שגיאה"}`);
    } catch (e) {
      setStatus("❌ Request failed");
    } finally {
      setStarLoading(false);
    }
  };

  const handleClearStarHouse = async () => {
    setStarLoading(true);
    try {
      await fetch("/api/admin/star-house", { method: "DELETE" });
      setStatus("✅ בית השבוע נמחק");
    } catch (e) {
      setStatus("❌ Request failed");
    } finally {
      setStarLoading(false);
    }
  };

  // ── Yad Sara Visibility ──────────────────────────────
  const [yadSaraVisible, setYadSaraVisible] = useState(true);
  const [yadSaraToggleLoading, setYadSaraToggleLoading] = useState(false);

  const loadYadSaraVisible = async () => {
    try {
      const res = await fetch("/api/admin/yad-sara");
      const data = await res.json();
      setYadSaraVisible(data.visible !== false);
    } catch (e) { console.error(e); }
  };

  const handleToggleYadSara = async () => {
    setYadSaraToggleLoading(true);
    try {
      const res = await fetch("/api/admin/yad-sara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !yadSaraVisible }),
      });
      const data = await res.json();
      if (data.ok) setYadSaraVisible(data.visible);
    } catch (e) { console.error(e); } finally { setYadSaraToggleLoading(false); }
  };

  // ── Donations ────────────────────────────────────────
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [donationsMeta, setDonationsMeta] = useState({ totalCoins: 0, totalIls: 0 });

  const loadDonations = async () => {
    setDonationsLoading(true);
    try {
      const res = await fetch("/api/donate");
      const data = await res.json();
      if (Array.isArray(data.donations)) setDonations(data.donations);
      setDonationsMeta({ totalCoins: data.totalCoins || 0, totalIls: data.totalIls || 0 });
    } catch (e) { console.error(e); } finally { setDonationsLoading(false); }
  };

  // ── Advertise Requests ───────────────────────────────
  const [advRequests, setAdvRequests] = useState([]);
  const [advLoading, setAdvLoading] = useState(true);
  const [advActionLoading, setAdvActionLoading] = useState(null);

  const loadAdvRequests = async () => {
    setAdvLoading(true);
    try {
      const res = await fetch("/api/advertise");
      const data = await res.json();
      if (Array.isArray(data.requests)) setAdvRequests(data.requests);
    } catch (e) { console.error(e); } finally { setAdvLoading(false); }
  };

  const handleAdvStatus = async (id, status) => {
    setAdvActionLoading(id + status);
    try {
      await fetch("/api/advertise", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setAdvRequests((prev) => prev.map((r) => String(r._id) === id ? { ...r, status } : r));
    } catch (e) { console.error(e); } finally { setAdvActionLoading(null); }
  };

  const handleAdvDelete = async (id) => {
    setAdvActionLoading(id + "delete");
    try {
      await fetch("/api/advertise", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setAdvRequests((prev) => prev.filter((r) => String(r._id) !== id));
    } catch (e) { console.error(e); } finally { setAdvActionLoading(null); }
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

  // ── Cashout Requests ─────────────────────────────────
  const [cashouts, setCashouts] = useState([]);
  const [cashoutsLoading, setCashoutsLoading] = useState(true);
  const [cashoutActionLoading, setCashoutActionLoading] = useState(null);

  const loadCashouts = async () => {
    setCashoutsLoading(true);
    try {
      const res = await fetch("/api/cashout");
      const data = await res.json();
      if (Array.isArray(data.requests)) setCashouts(data.requests);
    } catch (e) { console.error(e); } finally { setCashoutsLoading(false); }
  };

  const handleCashoutStatus = async (id, status) => {
    setCashoutActionLoading(id + status);
    try {
      await fetch("/api/cashout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setCashouts((prev) => prev.map((r) => String(r._id) === id ? { ...r, status } : r));
    } catch (e) { console.error(e); } finally { setCashoutActionLoading(null); }
  };

  const handleCashoutDelete = async (id) => {
    setCashoutActionLoading(id + "delete");
    try {
      await fetch("/api/cashout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setCashouts((prev) => prev.filter((r) => String(r._id) !== id));
    } catch (e) { console.error(e); } finally { setCashoutActionLoading(null); }
  };

  useEffect(() => {
    loadUsers();
    loadTaglines();
    loadAds();
    loadAdvRequests();
    loadDonations();
    loadYadSaraVisible();
    loadCashouts();
  }, []);

  const [tab, setTab] = useState("general");

  const TABS = [
    { id: "general", label: "כללי" },
    { id: "users", label: "משתמשים" },
    { id: "yadsara", label: "יד שרה" },
    { id: "advertisers", label: "פניות מפרסמים" },
  ];

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", direction: "rtl" }}>
      <h1 style={{ marginBottom: 24 }}>Admin</h1>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32, borderBottom: "2px solid #ddd" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 22px", border: "none", background: "none", cursor: "pointer",
              fontSize: 15, fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? "#2563eb" : "#555",
              borderBottom: tab === t.id ? "2px solid #2563eb" : "2px solid transparent",
              marginBottom: -2, transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && <>

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

      {/* ── Treasure Drop ── */}
      <h2>💎 הטלת אוצר</h2>
      <p style={{ fontSize: 13, color: "#555", marginTop: 0 }}>הטל אוצר על הלוח. המשתמש הראשון שימצא אותו יקבל 200 מטבעות.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>שורה (ריק = אקראי)</label>
          <input
            type="number"
            value={treasureRow}
            onChange={(e) => setTreasureRow(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", width: 90 }}
            placeholder="אקראי"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>עמודה (ריק = אקראי)</label>
          <input
            type="number"
            value={treasureCol}
            onChange={(e) => setTreasureCol(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", width: 90 }}
            placeholder="אקראי"
          />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>שם מפרסם (אופציונלי)</label>
          <input
            type="text"
            value={treasureSponsor}
            onChange={(e) => setTreasureSponsor(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", width: "100%" }}
            placeholder="למשל: פיצה גבריאל"
          />
        </div>
        <button
          onClick={handleDropTreasure}
          disabled={treasureLoading}
          style={{ padding: "8px 20px", cursor: "pointer", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}
        >
          {treasureLoading ? "מטיל..." : "💎 הטל אוצר"}
        </button>
      </div>

      <hr style={{ margin: "32px 0" }} />

      {/* ── Star House ── */}
      <h2>⭐ בית השבוע</h2>
      <p style={{ fontSize: 13, color: "#555", marginTop: 0 }}>בחר משתמש שיקבל כתר ⭐ על הבית שלו ויופיע בבאנר.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>UID של המשתמש</label>
          <select
            value={starUid}
            onChange={(e) => setStarUid(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", width: "100%" }}
          >
            <option value="">-- בחר משתמש --</option>
            {users.map((u) => (
              <option key={u.uid} value={u.uid}>{u.name || u.email} ({u.uid.slice(0, 8)}...)</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>שם מפרסם (אופציונלי)</label>
          <input
            type="text"
            value={starSponsor}
            onChange={(e) => setStarSponsor(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", width: "100%" }}
            placeholder="למשל: בנק הפועלים"
          />
        </div>
        <button
          onClick={handleSetStarHouse}
          disabled={starLoading || !starUid}
          style={{ padding: "8px 20px", cursor: "pointer", background: "#92400e", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}
        >
          {starLoading ? "שומר..." : "⭐ קבע בית השבוע"}
        </button>
        <button
          onClick={handleClearStarHouse}
          disabled={starLoading}
          style={{ padding: "8px 20px", cursor: "pointer", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6 }}
        >
          נקה
        </button>
      </div>

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

      {/* ── Cashout Requests ── */}
      <h2>💵 בקשות המרה לכסף אמיתי</h2>
      <button onClick={loadCashouts} disabled={cashoutsLoading} style={{ marginBottom: 16, padding: "6px 16px", cursor: "pointer" }}>
        {cashoutsLoading ? "טוען..." : "רענן"}
      </button>
      {cashoutsLoading ? <p>טוען...</p> : cashouts.length === 0 ? <p style={{ color: "#888" }}>אין בקשות עדיין.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "right" }}>
              <th style={th}>שם</th>
              <th style={th}>טלפון</th>
              <th style={th}>מטבעות</th>
              <th style={th}>שקלים</th>
              <th style={th}>תאריך</th>
              <th style={th}>סטטוס</th>
              <th style={th}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {cashouts.map((r) => {
              const id = String(r._id);
              const statusColors = { new: "#2563eb", paid: "#16a34a", cancelled: "#dc2626" };
              const statusLabels = { new: "חדש", paid: "שולם", cancelled: "בוטל" };
              return (
                <tr key={id} style={{ borderBottom: "1px solid #ddd", background: r.status === "new" ? "#f0fdf4" : "white" }}>
                  <td style={td}>{r.name || "—"}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{r.phone}</td>
                  <td style={td}>{r.coins?.toLocaleString()}</td>
                  <td style={{ ...td, color: "#15803d", fontWeight: 700 }}>₪{r.ils}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("he-IL") : "—"}</td>
                  <td style={td}>
                    <span style={{ color: statusColors[r.status] || "#333", fontWeight: 600 }}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </td>
                  <td style={{ ...td, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {r.status !== "paid" && (
                      <button onClick={() => handleCashoutStatus(id, "paid")} disabled={!!cashoutActionLoading} style={{ ...actionBtn, background: "#16a34a" }}>
                        {cashoutActionLoading === id + "paid" ? "..." : "✅ שולם"}
                      </button>
                    )}
                    {r.status !== "cancelled" && (
                      <button onClick={() => handleCashoutStatus(id, "cancelled")} disabled={!!cashoutActionLoading} style={{ ...actionBtn, background: "#d97706" }}>
                        {cashoutActionLoading === id + "cancelled" ? "..." : "בטל"}
                      </button>
                    )}
                    <button onClick={() => handleCashoutDelete(id)} disabled={!!cashoutActionLoading} style={{ ...actionBtn, background: "#dc2626" }}>
                      {cashoutActionLoading === id + "delete" ? "..." : "מחק"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      </> /* end general tab */}

      {tab === "users" && <>

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

      </> /* end users tab */}

      {tab === "yadsara" && <>

      {/* ── Yad Sara Visibility ── */}
      <h2>🏠 בניין יד שרה</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 14 }}>
          הבניין כרגע: <strong style={{ color: yadSaraVisible ? "#16a34a" : "#dc2626" }}>{yadSaraVisible ? "מוצג" : "מוסתר"}</strong>
        </span>
        <button
          onClick={handleToggleYadSara}
          disabled={yadSaraToggleLoading}
          style={{ padding: "8px 20px", cursor: "pointer", background: yadSaraVisible ? "#dc2626" : "#16a34a", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}
        >
          {yadSaraToggleLoading ? "..." : yadSaraVisible ? "הסתר בניין" : "הצג בניין"}
        </button>
      </div>

      <hr style={{ margin: "32px 0" }} />

      {/* ── Donations ── */}
      <h2>❤️ תרומות יד שרה</h2>
      <button onClick={loadDonations} disabled={donationsLoading} style={{ marginBottom: 16, padding: "6px 16px", cursor: "pointer" }}>
        {donationsLoading ? "טוען..." : "רענן"}
      </button>
      <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#be123c" }}>{donationsMeta.totalCoins.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#9f1239" }}>מטבעות שנתרמו</div>
        </div>
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#15803d" }}>₪{donationsMeta.totalIls.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#166534" }}>לתרומה ליד שרה</div>
        </div>
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#15803d" }}>{donations.length}</div>
          <div style={{ fontSize: 12, color: "#166534" }}>תורמים</div>
        </div>
      </div>
      {!donationsLoading && donations.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 8 }}>
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "right" }}>
              <th style={th}>שם</th>
              <th style={th}>מטבעות</th>
              <th style={th}>שקלים</th>
              <th style={th}>תאריך</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={String(d._id)} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={td}>{d.name || "—"}</td>
                <td style={td}>{d.coins}</td>
                <td style={{ ...td, color: "#15803d", fontWeight: 600 }}>₪{d.ils}</td>
                <td style={td}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString("he-IL") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      </> /* end yadsara tab */}

      {tab === "advertisers" && <>

      {/* ── Advertise Requests ── */}
      <h2>📬 פניות מפרסמים</h2>
      <button onClick={loadAdvRequests} disabled={advLoading} style={{ marginBottom: 16, padding: "6px 16px", cursor: "pointer" }}>
        {advLoading ? "טוען..." : "רענן"}
      </button>
      {advLoading ? <p>טוען...</p> : advRequests.length === 0 ? <p style={{ color: "#888" }}>אין פניות עדיין.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "right" }}>
              <th style={th}>שם</th>
              <th style={th}>חברה</th>
              <th style={th}>טלפון</th>
              <th style={th}>אימייל</th>
              <th style={th}>הודעה</th>
              <th style={th}>תאריך</th>
              <th style={th}>סטטוס</th>
              <th style={th}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {advRequests.map((r) => {
              const id = String(r._id);
              const statusColors = { new: "#2563eb", read: "#d97706", done: "#16a34a" };
              const statusLabels = { new: "חדש", read: "נקרא", done: "טופל" };
              return (
                <tr key={id} style={{ borderBottom: "1px solid #ddd", background: r.status === "new" ? "#eff6ff" : "white" }}>
                  <td style={td}>{r.name}</td>
                  <td style={{ ...td, color: "#666" }}>{r.company || "—"}</td>
                  <td style={td}>{r.phone}</td>
                  <td style={{ ...td, fontSize: 12, color: "#555" }}>{r.email || "—"}</td>
                  <td style={{ ...td, maxWidth: 240, wordBreak: "break-word" }}>{r.message}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("he-IL") : "—"}</td>
                  <td style={td}>
                    <span style={{ color: statusColors[r.status] || "#333", fontWeight: 600 }}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </td>
                  <td style={{ ...td, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {r.status !== "read" && (
                      <button onClick={() => handleAdvStatus(id, "read")} disabled={!!advActionLoading} style={{ ...actionBtn, background: "#d97706" }}>
                        {advActionLoading === id + "read" ? "..." : "סמן נקרא"}
                      </button>
                    )}
                    {r.status !== "done" && (
                      <button onClick={() => handleAdvStatus(id, "done")} disabled={!!advActionLoading} style={{ ...actionBtn, background: "#16a34a" }}>
                        {advActionLoading === id + "done" ? "..." : "טופל"}
                      </button>
                    )}
                    <button onClick={() => handleAdvDelete(id)} disabled={!!advActionLoading} style={{ ...actionBtn, background: "#dc2626" }}>
                      {advActionLoading === id + "delete" ? "..." : "מחק"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      </> /* end advertisers tab */}
    </div>
  );
}

const th = { padding: "10px 12px", borderBottom: "2px solid #ccc", fontWeight: 700 };
const td = { padding: "10px 12px" };
const actionBtn = { color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 13 };
