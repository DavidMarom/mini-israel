"use client";

import { useState, useEffect } from "react";
import {
  createHandleReseed,
  createHandleReseedOranges,
  createHandleReseedShirts,
  createHandleReseedPoop,
  createHandleDropTreasure,
  createHandleSetStarHouse,
  createHandleClearStarHouse,
  createHandleToggleLotteryPopup,
  createHandleToggleYadSara,
  createHandleAdvStatus,
  createHandleAdvDelete,
  createHandleUserAction,
  createHandleDeleteUser,
  createHandleEditSave,
  createHandleCashoutStatus,
  createHandleCashoutDelete,
  createHandleCreateFictive,
  createHandleDeleteFictive,
  createHandleSendPush,
  createHandleIdeaStatus,
  createHandleIdeaDelete,
  createHandleImplementIdea,
} from "./adminHandlers";

export default function AdminPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orangeLoading, setOrangeLoading] = useState(false);
  const [shirtLoading, setShirtLoading] = useState(false);
  const [poopLoading, setPoopLoading] = useState(false);

  // ── Board ────────────────────────────────────────────
  const handleReseed = createHandleReseed(setLoading, setStatus);
  const handleReseedOranges = createHandleReseedOranges(setOrangeLoading, setStatus);
  const handleReseedShirts = createHandleReseedShirts(setShirtLoading, setStatus);
  const handleReseedPoop = createHandleReseedPoop(setPoopLoading, setStatus);

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

  const handleDropTreasure = createHandleDropTreasure(treasureRow, treasureCol, treasureSponsor, setTreasureLoading, setStatus);

  // ── Star House ───────────────────────────────────────
  const [starUid, setStarUid] = useState("");
  const [starSponsor, setStarSponsor] = useState("");
  const [starLoading, setStarLoading] = useState(false);

  const handleSetStarHouse = createHandleSetStarHouse(starUid, starSponsor, setStarLoading, setStatus);
  const handleClearStarHouse = createHandleClearStarHouse(setStarLoading, setStatus);

  // ── Lottery Popup ────────────────────────────────────
  const [lotteryPopupEnabled, setLotteryPopupEnabled] = useState(true);
  const [lotteryPopupLoading, setLotteryPopupLoading] = useState(false);

  const loadLotteryPopup = async () => {
    try {
      const res = await fetch("/api/admin/lottery-popup");
      const data = await res.json();
      setLotteryPopupEnabled(data.enabled !== false);
    } catch (e) { console.error(e); }
  };

  const handleToggleLotteryPopup = createHandleToggleLotteryPopup(lotteryPopupEnabled, setLotteryPopupEnabled, setLotteryPopupLoading);

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

  const handleToggleYadSara = createHandleToggleYadSara(yadSaraVisible, setYadSaraVisible, setYadSaraToggleLoading);

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

  const handleAdvStatus = createHandleAdvStatus(setAdvActionLoading, setAdvRequests);
  const handleAdvDelete = createHandleAdvDelete(setAdvActionLoading, setAdvRequests);

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

  const handleUserAction = createHandleUserAction(setActionLoading, setUsers);
  const handleDeleteUser = createHandleDeleteUser(setActionLoading, setUsers);

  // ── Edit User ─────────────────────────────────────────
  const [editUser, setEditUser] = useState(null); // { uid, name, email, money, bio }
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const openEditUser = (u) => {
    setEditUser({ uid: u.uid, name: u.name || "", email: u.email || "", money: u.money ?? 0, bio: u.bio || "" });
    setEditError("");
  };

  const handleEditSave = createHandleEditSave(editUser, setUsers, setEditUser, setEditSaving, setEditError);

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

  const handleCashoutStatus = createHandleCashoutStatus(setCashoutActionLoading, setCashouts);
  const handleCashoutDelete = createHandleCashoutDelete(setCashoutActionLoading, setCashouts);

  // ── Fictive Users ─────────────────────────────────────
  const [fictiveUsers, setFictiveUsers] = useState([]);
  const [fictiveLoading, setFictiveLoading] = useState(true);
  const [fictiveCreating, setFictiveCreating] = useState(false);
  const [fictiveDeleteLoading, setFictiveDeleteLoading] = useState(null);

  const loadFictiveUsers = async () => {
    setFictiveLoading(true);
    try {
      const res = await fetch("/api/admin/fictive-users");
      const data = await res.json();
      if (Array.isArray(data.users)) setFictiveUsers(data.users);
    } catch (e) { console.error(e); } finally { setFictiveLoading(false); }
  };

  const handleCreateFictive = createHandleCreateFictive(setFictiveCreating, setFictiveUsers);
  const handleDeleteFictive = createHandleDeleteFictive(setFictiveDeleteLoading, setFictiveUsers);

  useEffect(() => {
    loadUsers();
    loadTaglines();
    loadAds();
    loadAdvRequests();
    loadDonations();
    loadYadSaraVisible();
    loadCashouts();
    loadFictiveUsers();
    loadLotteryPopup();
  }, []);

  const [tab, setTab] = useState("general");

  // ── Push notifications ───────────────────────────────
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushLoading, setPushLoading] = useState(false);
  const [pushResult, setPushResult] = useState(null);

  const handleSendPush = createHandleSendPush(pushTitle, pushBody, setPushLoading, setPushResult, setPushTitle, setPushBody);

  // ── Feature Ideas ─────────────────────────────────────
  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasActionLoading, setIdeasActionLoading] = useState(null);

  const loadIdeas = async () => {
    setIdeasLoading(true);
    try {
      const res = await fetch("/api/feature-ideas");
      const data = await res.json();
      if (Array.isArray(data.ideas)) setIdeas(data.ideas);
    } catch (e) { console.error(e); } finally { setIdeasLoading(false); }
  };

  const handleIdeaStatus = createHandleIdeaStatus(setIdeasActionLoading, setIdeas);
  const handleIdeaDelete = createHandleIdeaDelete(setIdeasActionLoading, setIdeas);
  const handleImplementIdea = createHandleImplementIdea(setIdeasActionLoading, setIdeas);

  const TABS = [
    { id: "general", label: "כללי" },
    { id: "users", label: "משתמשים" },
    { id: "yadsara", label: "יד שרה" },
    { id: "advertisers", label: "פניות מפרסמים" },
    { id: "ideas", label: "רעיונות" },
    { id: "fictive", label: "משתמשים פיקטיביים" },
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

      {/* ── Lottery Popup ── */}
      <h2>🎰 פופאפ הגרלה</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 14 }}>
          הפופאפ כרגע: <strong style={{ color: lotteryPopupEnabled ? "#16a34a" : "#dc2626" }}>{lotteryPopupEnabled ? "פעיל" : "כבוי"}</strong>
        </span>
        <button
          onClick={handleToggleLotteryPopup}
          disabled={lotteryPopupLoading}
          style={{ padding: "8px 20px", cursor: "pointer", background: lotteryPopupEnabled ? "#dc2626" : "#16a34a", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}
        >
          {lotteryPopupLoading ? "..." : lotteryPopupEnabled ? "כבה פופאפ" : "הפעל פופאפ"}
        </button>
      </div>

      <hr style={{ margin: "32px 0" }} />

      {/* ── Board ── */}
      <h2>לוח</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={handleReseed} disabled={loading} style={{ padding: "8px 20px", cursor: "pointer" }}>
          {loading ? "Seeding…" : "🍎 Reseed Apples"}
        </button>
        <button onClick={handleReseedOranges} disabled={orangeLoading} style={{ padding: "8px 20px", cursor: "pointer" }}>
          {orangeLoading ? "Seeding…" : "🍊 Reseed Oranges"}
        </button>
        <button onClick={handleReseedShirts} disabled={shirtLoading} style={{ padding: "8px 20px", cursor: "pointer" }}>
          {shirtLoading ? "Seeding…" : "👕 Reseed Shirts"}
        </button>
        <button onClick={handleReseedPoop} disabled={poopLoading} style={{ padding: "8px 20px", cursor: "pointer" }}>
          {poopLoading ? "Seeding…" : "💩 Reseed Poop"}
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
              <th style={th}>₪</th>
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
                  <td style={td}>{r.name || "-"}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{r.phone}</td>
                  <td style={td}>{r.coins?.toLocaleString()}</td>
                  <td style={{ ...td, color: "#15803d", fontWeight: 700 }}>₪{r.ils}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("he-IL") : "-"}</td>
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

      {/* ── Push Notifications ── */}
      <h2>🔔 שליחת פוש לכל המשתמשים</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
        <input
          type="text"
          placeholder="כותרת (אופציונלי – ברירת מחדל: מיני ישראל 🏠)"
          value={pushTitle}
          onChange={(e) => setPushTitle(e.target.value)}
          style={{
            padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc",
            fontSize: 14, direction: "rtl", fontFamily: "sans-serif",
          }}
        />
        <textarea
          placeholder="תוכן ההודעה..."
          value={pushBody}
          onChange={(e) => setPushBody(e.target.value)}
          rows={4}
          style={{
            padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc",
            fontSize: 14, direction: "rtl", fontFamily: "sans-serif", resize: "vertical",
          }}
        />
        <button
          onClick={handleSendPush}
          disabled={pushLoading || !pushBody.trim()}
          style={{
            ...actionBtn, background: "#2563eb", padding: "11px 28px",
            fontSize: 15, borderRadius: 8, alignSelf: "flex-start",
            opacity: (!pushBody.trim() || pushLoading) ? 0.5 : 1,
          }}
        >
          {pushLoading ? "שולח..." : "📤 שלח פוש"}
        </button>
        {pushResult && (
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: pushResult.startsWith("✅") ? "#16a34a" : "#dc2626" }}>
            {pushResult}
          </p>
        )}
      </div>
      <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #eee" }} />

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
              <th style={th}>📲 הזמנות WA</th>
              <th style={th}>נרשם</th>
              <th style={th}>סטטוס</th>
              <th style={th}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} style={{ borderBottom: "1px solid #ddd", background: u.suspended ? "#fff0f0" : "white" }}>
                <td style={td}>{u.name || "-"}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>{u.money ?? 0}</td>
                <td style={{ ...td, textAlign: "center", fontWeight: u.waClicks ? 700 : 400, color: u.waClicks ? "#16a34a" : "#aaa" }}>{u.waClicks ?? 0}</td>
                <td style={td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("he-IL") : "-"}</td>
                <td style={td}>
                  {u.suspended
                    ? <span style={{ color: "#c00", fontWeight: 600 }}>מושעה</span>
                    : <span style={{ color: "#080" }}>פעיל</span>}
                </td>
                <td style={{ ...td, display: "flex", gap: 6 }}>
                  <button onClick={() => openEditUser(u)} style={{ ...actionBtn, background: "#2563eb" }}>
                    ✏️ ערוך
                  </button>
                  {u.suspended ? (
                    <button onClick={() => handleUserAction(u.uid, "unsuspend")} disabled={actionLoading === u.uid} style={{ ...actionBtn, background: "#6b7280" }}>
                      {actionLoading === u.uid ? "..." : "בטל השעיה"}
                    </button>
                  ) : (
                    <button onClick={() => handleUserAction(u.uid, "suspend")} disabled={actionLoading === u.uid} style={{ ...actionBtn, background: "#dc2626" }}>
                      {actionLoading === u.uid ? "..." : "השעה"}
                    </button>
                  )}
                  <button onClick={() => handleDeleteUser(u.uid, u.name)} disabled={actionLoading === u.uid} style={{ ...actionBtn, background: "#7f1d1d" }}>
                    {actionLoading === u.uid ? "..." : "🗑️ מחק"}
                  </button>
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
              <th style={th}>₪</th>
              <th style={th}>תאריך</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={String(d._id)} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={td}>{d.name || "-"}</td>
                <td style={td}>{d.coins}</td>
                <td style={{ ...td, color: "#15803d", fontWeight: 600 }}>₪{d.ils}</td>
                <td style={td}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString("he-IL") : "-"}</td>
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
                  <td style={{ ...td, color: "#666" }}>{r.company || "-"}</td>
                  <td style={td}>{r.phone}</td>
                  <td style={{ ...td, fontSize: 12, color: "#555" }}>{r.email || "-"}</td>
                  <td style={{ ...td, maxWidth: 240, wordBreak: "break-word" }}>{r.message}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("he-IL") : "-"}</td>
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

      {tab === "ideas" && <>

      {/* ── Feature Ideas ── */}
      <h2>💡 רעיונות לפיצ'רים</h2>
      <button onClick={loadIdeas} disabled={ideasLoading} style={{ marginBottom: 16, padding: "6px 16px", cursor: "pointer" }}>
        {ideasLoading ? "טוען..." : "רענן"}
      </button>
      {ideasLoading ? <p>טוען...</p> : ideas.length === 0 ? <p style={{ color: "#888" }}>אין רעיונות עדיין.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "right" }}>
              <th style={th}>שם</th>
              <th style={th}>רעיון</th>
              <th style={th}>תאריך</th>
              <th style={th}>סטטוס</th>
              <th style={th}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {ideas.map((r) => {
              const id = String(r._id);
              const statusColors = { new: "#2563eb", read: "#d97706", implementing: "#7c3aed", done: "#16a34a" };
              const statusLabels = { new: "חדש", read: "נקרא", implementing: "מיישם...", done: "יושם" };
              return (
                <tr key={id} style={{ borderBottom: "1px solid #ddd", background: r.status === "new" ? "#eff6ff" : "white" }}>
                  <td style={td}>{r.name || "-"}</td>
                  <td style={{ ...td, maxWidth: 320, wordBreak: "break-word" }}>{r.idea}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("he-IL") : "-"}</td>
                  <td style={td}>
                    <span style={{ color: statusColors[r.status] || "#333", fontWeight: 600 }}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </td>
                  <td style={{ ...td, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {r.status !== "read" && (
                      <button onClick={() => handleIdeaStatus(id, "read")} disabled={!!ideasActionLoading} style={{ ...actionBtn, background: "#d97706" }}>
                        {ideasActionLoading === id + "read" ? "..." : "נקרא"}
                      </button>
                    )}
                    {r.status !== "done" && (
                      <button onClick={() => handleIdeaStatus(id, "done")} disabled={!!ideasActionLoading} style={{ ...actionBtn, background: "#16a34a" }}>
                        {ideasActionLoading === id + "done" ? "..." : "יושם"}
                      </button>
                    )}
                    {r.status !== "implementing" && r.status !== "done" && (
                      <button onClick={() => handleImplementIdea(id)} disabled={!!ideasActionLoading} style={{ ...actionBtn, background: "#7c3aed" }}>
                        {ideasActionLoading === id + "implement" ? "..." : "🤖 יישם"}
                      </button>
                    )}
                    {r.prUrl && (
                      <a href={r.prUrl} target="_blank" rel="noopener noreferrer" style={{ ...actionBtn, background: "#0f172a", border: "1px solid #334155", textDecoration: "none", display: "inline-block" }}>
                        PR
                      </a>
                    )}
                    <button onClick={() => handleIdeaDelete(id)} disabled={!!ideasActionLoading} style={{ ...actionBtn, background: "#dc2626" }}>
                      {ideasActionLoading === id + "delete" ? "..." : "מחק"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      </> /* end ideas tab */}

      {tab === "fictive" && <>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            onClick={handleCreateFictive}
            disabled={fictiveCreating}
            style={{ padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            {fictiveCreating ? "יוצר..." : "➕ צור משתמש פיקטיבי"}
          </button>
          <button onClick={loadFictiveUsers} disabled={fictiveLoading} style={{ padding: "8px 16px", cursor: "pointer" }}>
            {fictiveLoading ? "טוען..." : "רענן"}
          </button>
        </div>

        {fictiveLoading ? <p>טוען...</p> : fictiveUsers.length === 0 ? (
          <p style={{ color: "#888" }}>אין משתמשים פיקטיביים עדיין.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f0f0f0", textAlign: "right" }}>
                <th style={th}>שם</th>
                <th style={th}>UID</th>
                <th style={th}>מטבעות</th>
                <th style={th}>מיקום בית</th>
                <th style={th}>נוצר</th>
                <th style={th}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {fictiveUsers.map((u) => (
                <tr key={u.uid} style={{ borderBottom: "1px solid #ddd", background: "#faf5ff" }}>
                  <td style={{ ...td, fontWeight: 600 }}>{u.name}</td>
                  <td style={{ ...td, fontSize: 11, color: "#666" }}>{u.uid}</td>
                  <td style={td}>{u.money?.toLocaleString()}</td>
                  <td style={{ ...td, fontSize: 12, color: "#555" }}>
                    {u.houseRow !== undefined ? `שורה ${u.houseRow}, עמודה ${u.houseCol}` : "-"}
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("he-IL") : "-"}
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => handleDeleteFictive(u.uid)}
                      disabled={fictiveDeleteLoading === u.uid}
                      style={{ ...actionBtn, background: "#dc2626" }}
                    >
                      {fictiveDeleteLoading === u.uid ? "..." : "מחק"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </> /* end fictive tab */}

      {/* ── Edit User Modal ── */}
      {editUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setEditUser(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", width: "100%", maxWidth: 420, direction: "rtl", display: "flex", flexDirection: "column", gap: 14 }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: 0, fontSize: 18 }}>✏️ עריכת משתמש</h2>

            {[
              { label: "שם", key: "name", type: "text" },
              { label: "אימייל", key: "email", type: "email" },
              { label: "מטבעות", key: "money", type: "number" },
              { label: "ביו", key: "bio", type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>{label}</label>
                <input
                  type={type}
                  value={editUser[key]}
                  onChange={(e) => setEditUser((prev) => ({ ...prev, [key]: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14, direction: key === "email" ? "ltr" : "rtl" }}
                />
              </div>
            ))}

            {editError && <p style={{ margin: 0, color: "#dc2626", fontSize: 13 }}>{editError}</p>}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-start" }}>
              <button onClick={handleEditSave} disabled={editSaving}
                style={{ ...actionBtn, background: "#16a34a", padding: "10px 24px", fontSize: 14, borderRadius: 8 }}>
                {editSaving ? "שומר..." : "שמור"}
              </button>
              <button onClick={() => setEditUser(null)}
                style={{ ...actionBtn, background: "#6b7280", padding: "10px 20px", fontSize: 14, borderRadius: 8 }}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: "10px 12px", borderBottom: "2px solid #ccc", fontWeight: 700 };
const td = { padding: "10px 12px" };
const actionBtn = { color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 13 };
