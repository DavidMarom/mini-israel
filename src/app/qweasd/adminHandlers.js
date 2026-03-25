// ── Internal generic factories ────────────────────────

const createReseedHandler = (endpoint, dataKey, label) =>
  (setLoading, setStatus) => async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      setStatus(data.ok ? `✅ Seeded ${data[dataKey]} ${label}.` : "❌ Error: " + (data.error || "Unknown error"));
    } catch (e) {
      setStatus("❌ Request failed");
    } finally {
      setLoading(false);
    }
  };

const createToggleHandler = (endpoint, key) =>
  (currentValue, setValue, setLoading) => async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !currentValue }),
      });
      const data = await res.json();
      if (data.ok) setValue(data[key]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

const createStatusHandler = (endpoint) =>
  (setActionLoading, setItems) => async (id, status) => {
    setActionLoading(id + status);
    try {
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setItems((prev) => prev.map((r) => String(r._id) === id ? { ...r, status } : r));
    } catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

const createDeleteItemHandler = (endpoint) =>
  (setActionLoading, setItems) => async (id) => {
    setActionLoading(id + "delete");
    try {
      await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.filter((r) => String(r._id) !== id));
    } catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

// ── Board ────────────────────────────────────────────

export const createHandleReseed = createReseedHandler("/api/admin/reseed-apples", "apples", "apples");
export const createHandleReseedOranges = createReseedHandler("/api/admin/reseed-oranges", "oranges", "oranges");
export const createHandleReseedShirts = createReseedHandler("/api/admin/reseed-shirts", "shirts", "shirts");
export const createHandleReseedPoop = createReseedHandler("/api/admin/reseed-poop", "count", "poops");

// ── Treasure Drop ────────────────────────────────────

export const createHandleDropTreasure =
  (treasureRow, treasureCol, treasureSponsor, setTreasureLoading, setStatus) => async () => {
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

export const createHandleSetStarHouse =
  (starUid, starSponsor, setStarLoading, setStatus) => async () => {
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

export const createHandleClearStarHouse = (setStarLoading, setStatus) => async () => {
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

// ── Lottery Popup ────────────────────────────────────

export const createHandleToggleLotteryPopup = createToggleHandler("/api/admin/lottery-popup", "enabled");

// ── Yad Sara Visibility ──────────────────────────────

export const createHandleToggleYadSara = createToggleHandler("/api/admin/yad-sara", "visible");

// ── Advertise Requests ───────────────────────────────

export const createHandleAdvStatus = createStatusHandler("/api/advertise");
export const createHandleAdvDelete = createDeleteItemHandler("/api/advertise");

// ── Users ─────────────────────────────────────────────

export const createHandleUserAction = (setActionLoading, setUsers) => async (uid, action) => {
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

export const createHandleDeleteUser = (setActionLoading, setUsers) => async (uid, name) => {
  if (!confirm(`למחוק את המשתמש "${name || uid}"? פעולה זו בלתי הפיכה.`)) return;
  setActionLoading(uid);
  try {
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid }),
    });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.uid !== uid));
  } catch (e) { console.error(e); } finally { setActionLoading(null); }
};

// ── Edit User ─────────────────────────────────────────

export const createHandleEditSave =
  (editUser, setUsers, setEditUser, setEditSaving, setEditError) => async () => {
    setEditSaving(true);
    setEditError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser),
      });
      const data = await res.json();
      if (data.ok) {
        setUsers((prev) => prev.map((u) => u.uid === editUser.uid ? { ...u, ...editUser, money: Number(editUser.money) } : u));
        setEditUser(null);
      } else {
        setEditError(data.error || "שגיאה בשמירה");
      }
    } catch (e) { setEditError("שגיאה, נסה שוב"); } finally { setEditSaving(false); }
  };

// ── Cashout Requests ─────────────────────────────────

export const createHandleCashoutStatus = createStatusHandler("/api/cashout");
export const createHandleCashoutDelete = createDeleteItemHandler("/api/cashout");

// ── Fictive Users ─────────────────────────────────────

export const createHandleCreateFictive = (setFictiveCreating, setFictiveUsers) => async () => {
  setFictiveCreating(true);
  try {
    const res = await fetch("/api/admin/fictive-users", { method: "POST" });
    const data = await res.json();
    if (data.ok) setFictiveUsers((prev) => [data.user, ...prev]);
  } catch (e) { console.error(e); } finally { setFictiveCreating(false); }
};

export const createHandleDeleteFictive = (setFictiveDeleteLoading, setFictiveUsers) => async (uid) => {
  setFictiveDeleteLoading(uid);
  try {
    await fetch("/api/admin/fictive-users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid }),
    });
    setFictiveUsers((prev) => prev.filter((u) => u.uid !== uid));
  } catch (e) { console.error(e); } finally { setFictiveDeleteLoading(null); }
};

// ── Push Notifications ───────────────────────────────

export const createHandleSendPush =
  (pushTitle, pushBody, setPushLoading, setPushResult, setPushTitle, setPushBody) => async () => {
    if (!pushBody.trim()) return;
    setPushLoading(true);
    setPushResult(null);
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pushTitle.trim() || "מיני ישראל 🏠", body: pushBody.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setPushResult(`✅ נשלח ל-${data.sent} משתמשים (נכשל: ${data.failed})`);
        setPushBody("");
        setPushTitle("");
      } else {
        setPushResult("❌ שגיאה: " + (data.error || "Unknown"));
      }
    } catch (e) {
      setPushResult("❌ בקשה נכשלה");
    } finally {
      setPushLoading(false);
    }
  };

// ── Feature Ideas ─────────────────────────────────────

export const createHandleIdeaStatus = createStatusHandler("/api/feature-ideas");
export const createHandleIdeaDelete = createDeleteItemHandler("/api/feature-ideas");

export const createHandleImplementIdea = (setIdeasActionLoading, setIdeas) => async (id) => {
  if (!confirm("להפעיל את הבינה המלאכותית ליישום הרעיון? תיווצר ענף ו-PR אוטומטית.")) return;
  setIdeasActionLoading(id + "implement");
  try {
    const res = await fetch("/api/admin/implement-idea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.ok) {
      setIdeas((prev) => prev.map((r) => String(r._id) === id ? { ...r, status: "implementing" } : r));
      alert("✅ הבינה המלאכותית התחילה לעבוד! עקוב אחרי הלוג בשרת. ה-PR ייפתח בעוד מספר דקות.");
    } else {
      alert("❌ שגיאה: " + (data.error || "Unknown"));
    }
  } catch (e) { alert("❌ שגיאה בשליחה"); } finally { setIdeasActionLoading(null); }
};
