// ── Board ────────────────────────────────────────────

export const createHandleReseed = (setLoading, setStatus) => async () => {
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

export const createHandleReseedOranges = (setOrangeLoading, setStatus) => async () => {
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

export const createHandleReseedShirts = (setShirtLoading, setStatus) => async () => {
  setShirtLoading(true);
  setStatus(null);
  try {
    const res = await fetch("/api/admin/reseed-shirts", { method: "POST" });
    const data = await res.json();
    setStatus(data.ok ? `✅ Seeded ${data.shirts} shirts.` : "❌ Error: " + (data.error || "Unknown error"));
  } catch (e) {
    setStatus("❌ Request failed");
  } finally {
    setShirtLoading(false);
  }
};

export const createHandleReseedPoop = (setPoopLoading, setStatus) => async () => {
  setPoopLoading(true);
  setStatus(null);
  try {
    const res = await fetch("/api/admin/reseed-poop", { method: "POST" });
    const data = await res.json();
    setStatus(data.ok ? `✅ Seeded ${data.count} poops.` : "❌ Error: " + (data.error || "Unknown error"));
  } catch (e) {
    setStatus("❌ Request failed");
  } finally {
    setPoopLoading(false);
  }
};

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

export const createHandleToggleLotteryPopup =
  (lotteryPopupEnabled, setLotteryPopupEnabled, setLotteryPopupLoading) => async () => {
    setLotteryPopupLoading(true);
    try {
      const res = await fetch("/api/admin/lottery-popup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !lotteryPopupEnabled }),
      });
      const data = await res.json();
      if (data.ok) setLotteryPopupEnabled(data.enabled);
    } catch (e) { console.error(e); } finally { setLotteryPopupLoading(false); }
  };

// ── Yad Sara Visibility ──────────────────────────────

export const createHandleToggleYadSara =
  (yadSaraVisible, setYadSaraVisible, setYadSaraToggleLoading) => async () => {
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

// ── Advertise Requests ───────────────────────────────

export const createHandleAdvStatus = (setAdvActionLoading, setAdvRequests) => async (id, status) => {
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

export const createHandleAdvDelete = (setAdvActionLoading, setAdvRequests) => async (id) => {
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

export const createHandleCashoutStatus = (setCashoutActionLoading, setCashouts) => async (id, status) => {
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

export const createHandleCashoutDelete = (setCashoutActionLoading, setCashouts) => async (id) => {
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

export const createHandleIdeaStatus = (setIdeasActionLoading, setIdeas) => async (id, status) => {
  setIdeasActionLoading(id + status);
  try {
    await fetch("/api/feature-ideas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setIdeas((prev) => prev.map((r) => String(r._id) === id ? { ...r, status } : r));
  } catch (e) { console.error(e); } finally { setIdeasActionLoading(null); }
};

export const createHandleIdeaDelete = (setIdeasActionLoading, setIdeas) => async (id) => {
  setIdeasActionLoading(id + "delete");
  try {
    await fetch("/api/feature-ideas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setIdeas((prev) => prev.filter((r) => String(r._id) !== id));
  } catch (e) { console.error(e); } finally { setIdeasActionLoading(null); }
};

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
