"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { auth } from "../services/fb";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, } from "firebase/auth";
import { GameBoard, NameModal, AuthCard, MessagesCard } from "../components";
import useUserStore from "../store/useUserStore";
import { fireConfetti } from "../utils/confetti";

const provider = new GoogleAuthProvider();

export default function Home() {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [taglines, setTaglines] = useState([]);
  const [starHouse, setStarHouse] = useState(null); // { name, sponsor }
  const [showLotteryPopup, setShowLotteryPopup] = useState(false);
  const [showMissile, setShowMissile] = useState(false);
  const [missileBottom, setMissileBottom] = useState(30);

  useEffect(() => {
    const check = () => setIsMobilePortrait(window.innerWidth < window.innerHeight);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fireMissile = () => {
      setMissileBottom(5 + Math.random() * 25);
      setShowMissile(true);
      setTimeout(() => setShowMissile(false), 4000);
    };
    const interval = setInterval(fireMissile, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/admin/taglines")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.taglines)) setTaglines(data.taglines); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.starHouse) setStarHouse(data.starHouse);
        if (data.lotteryPopupEnabled) setShowLotteryPopup(true);
      })
      .catch(console.error);
  }, []);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setSplashFading(true);
      setTimeout(() => setShowSplash(false), 300);
    }, 2000);
    return () => clearTimeout(t);
  }, []);
  const [error, setError] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [composeTarget, setComposeTarget] = useState(null); // { ownerUid, ownerName }
  const [composeText, setComposeText] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeItemIndex, setComposeItemIndex] = useState(null);
  const [poopThrowing, setPoopThrowing] = useState(false);
  const [justPoopedUid, setJustPoopedUid] = useState(null);
  const [hasFarm, setHasFarm] = useState(false);
  const [buyingFarm, setBuyingFarm] = useState(false);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);

  const {
    user: storedUser,
    setUser: setUserStore,
    clearUser,
    setNeedsHousePlacement,
  } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Ensure the user exists in MongoDB
        syncUserWithBackend(firebaseUser).catch((err) => {
          console.error("Failed to sync user with backend", err);
          setError("לא ניתן לשמור את הפרופיל שלך, נסה שוב מאוחר יותר.");
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const syncUserWithBackend = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/auth/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to sync user");
      }

      const data = await res.json();
      if (data?.user) {
        setBackendUser(data.user);

        const mergedUser = {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          name: data.user.name || firebaseUser.displayName || firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          mongoId: data.user._id,
          money: typeof data.user.money === "number" ? data.user.money : 0,
          bio: data.user.bio ?? null,
          inventory: data.user.inventory ?? [],
          isVIP: data.user.isVIP ?? false,
          powerBoostExpiry: data.user.powerBoostExpiry ?? null,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
        };

        setUserStore(mergedUser);

        if (data.created) {
          setNameInput(mergedUser.name || "");
          setShowNameModal(true);
          setNeedsHousePlacement(true);
        }
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError("ההתחברות באמצעות Google נכשלה, נסה שוב.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await signOut(auth);
      clearUser();
      setBackendUser(null);
    } catch (err) {
      console.error(err);
      setError("ההתנתקות נכשלה, נסה שוב.");
    }
  };

  const saveName = async (newName, newBio) => {
    if (!backendUser) return false;
    const trimmed = newName.trim();
    if (!trimmed) return false;

    try {
      const res = await fetch("/api/auth/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: backendUser.uid,
          email: backendUser.email,
          name: trimmed,
          bio: typeof newBio === "string" ? newBio.trim() : undefined,
          forceUpdate: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update name");
      }

      const data = await res.json();
      if (data?.user) {
        setBackendUser(data.user);
        setUserStore((prev) => ({
          ...(prev || {}),
          name: data.user.name,
          bio: data.user.bio ?? null,
          updatedAt: data.user.updatedAt,
        }));
      }

      return true;
    } catch (err) {
      console.error(err);
      setError("לא ניתן לשמור את השם, נסה שוב.");
      return false;
    }
  };

  const handleSaveName = async () => {
    const ok = await saveName(nameInput);
    if (ok) {
      setShowNameModal(false);
    }
  };

  const handleSendMessage = async () => {
    if (!composeTarget || !storedUser) return;
    if (composeItemIndex === null && !composeText.trim()) return;
    setComposeSending(true);
    try {
      if (composeItemIndex !== null) {
        const res = await fetch("/api/items/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromUid: storedUser.firebaseUid,
            fromName: storedUser.name,
            toUid: composeTarget.ownerUid,
            toName: composeTarget.ownerName,
            itemIndex: composeItemIndex,
            text: composeText,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setUserStore((prev) => ({ ...prev, inventory: data.inventory }));
        }
      } else {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromUid: storedUser.firebaseUid,
            fromName: storedUser.name,
            toUid: composeTarget.ownerUid,
            toName: composeTarget.ownerName,
            text: composeText,
          }),
        });
      }
      setComposeTarget(null);
      setComposeText("");
      setComposeItemIndex(null);
    } catch (err) {
      console.error(err);
    } finally {
      setComposeSending(false);
    }
  };

  const handleBuyVip = async () => {
    if (!storedUser) return;
    const uid = storedUser.firebaseUid;
    try {
      const res = await fetch("/api/upgrade/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(
          data.error === "Insufficient funds" ? "אין מספיק מטבעות" :
          data.error === "Already VIP" ? "כבר VIP!" :
          "שגיאה, נסה שוב"
        );
        return;
      }
      setUserStore((prev) => ({ ...prev, money: data.money, isVIP: true }));
      fireConfetti();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuyFarm = async () => {
    if (!storedUser || buyingFarm) return;
    const uid = storedUser.firebaseUid;
    setBuyingFarm(true);
    try {
      const res = await fetch("/api/farm/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(
          data.error === "Insufficient funds" ? "אין מספיק מטבעות" :
          data.error === "No house found" ? "יש לבנות בית לפני קניית חווה" :
          data.error === "Already has farm" ? "כבר יש לך חווה" :
          "שגיאה, נסה שוב"
        );
        return;
      }
      setUserStore((prev) => ({ ...prev, money: data.money }));
      fireConfetti();
      if (data.newHouseRow != null) {
        setUserStore((prev) => ({ ...prev, mainHouse: { row: data.newHouseRow, col: data.newHouseCol } }));
      }
      setHasFarm(true);
      setBoardRefreshKey((k) => k + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setBuyingFarm(false);
    }
  };

  const handleThrowPoop = async () => {
    if (!composeTarget || !storedUser || poopThrowing) return;
    const uid = storedUser.firebaseUid || storedUser.uid;
    setPoopThrowing(true);
    try {
      const res = await fetch("/api/poop/throw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, targetUid: composeTarget.ownerUid }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserStore((prev) => ({ ...prev, inventory: data.inventory }));
        setJustPoopedUid(composeTarget.ownerUid);
        setComposeTarget(null);
        setComposeItemIndex(null);
      } else {
        alert(data.error || "שגיאה, נסה שוב");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPoopThrowing(false);
    }
  };

  return (
    <div className={styles.page}>
      {showSplash && (
        <div className={`${styles.splash} ${splashFading ? styles.splashFading : ""}`}>
          <img src="/assets/splash.png" alt="מיני ישראל" className={styles.splashImg} />
          <div className={styles.splashLoader}>
            <div className={styles.splashSpinner} />
          </div>
        </div>
      )}
      {isMobilePortrait && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "1.1rem", direction: "rtl", textAlign: "center", pointerEvents: "none", zIndex: 9999, color: "#fff", textShadow: "0 1px 6px #000" }}>
          סובב את המכשיר לאופק כדי לשחק במיני ישראל
        </div>
      )}
      <div className={styles.boardLayer}>
        <GameBoard onOtherHouseClick={(target) => { setComposeTarget(target); setComposeText(""); setComposeItemIndex(null); }} justPoopedUid={justPoopedUid} boardRefreshKey={boardRefreshKey} onHasFarmChange={setHasFarm} />
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <button className={`${styles.sidebarToggle}${sidebarOpen ? ` ${styles.sidebarToggleHidden}` : ""}`} onClick={() => setSidebarOpen(true)} aria-label="פתח תפריט">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="18" rx="1" />
          <path d="M14 7l4 5-4 5" />
        </svg>
      </button>
      {sidebarOpen && <div className={styles.sidebarBackdrop} onClick={() => setSidebarOpen(false)} />}
      <div className={`${styles.overlay} ${sidebarOpen ? styles.overlayOpen : ""}`}>
        <button className={styles.sidebarClose} onClick={() => setSidebarOpen(false)} aria-label="סגור תפריט">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className={styles.siteHeader}>
          <img src="/assets/main-house.png" alt="מיני ישראל" className={styles.siteLogo} />
          <span className={styles.siteTitle}>מיני ישראל</span>
          <a
            href="https://wa.me/?text=%D7%91%D7%95%D7%90%D7%95%20%D7%9C%D7%A9%D7%97%D7%A7%20%D7%91%D7%9E%D7%99%D7%A0%D7%99%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C%21%20https%3A%2F%2Fwww.mini-israel.com%2F"
            className={styles.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            title="שתף בוואטסאפ"
            onClick={() => { const uid = storedUser?.firebaseUid; if (uid) fetch("/api/track/wa-click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid }) }); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={styles.whatsappIcon} fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
          <a href="/advertisers" className={styles.advertisersLink} target="_blank" rel="noopener noreferrer">למפרסמים</a>
        </div>
        <AuthCard
          loading={loading}
          user={user}
          displayName={
            (storedUser && storedUser.name) ||
            (backendUser && (backendUser.name || backendUser.email)) ||
            (user && user.email) ||
            ""
          }
          money={
            (storedUser && storedUser.money) ||
            (backendUser && backendUser.money) ||
            0
          }
          bio={(storedUser && storedUser.bio) || (backendUser && backendUser.bio) || ""}
          inventory={(storedUser && storedUser.inventory) || []}
          photoURL={user ? user.photoURL : null}
          onGoogleSignIn={handleGoogleSignIn}
          onLogout={handleLogout}
          error={error}
          onUpdateName={saveName}
          onBuyFarm={handleBuyFarm}
          hasFarm={hasFarm}
          buyingFarm={buyingFarm}
          isVIP={storedUser?.isVIP ?? false}
          onBuyVip={handleBuyVip}
        />
        <MessagesCard user={storedUser} />
        {starHouse && (
          <div className={styles.starHouseBanner}>
            <span className={styles.starHouseIcon}>⭐</span>
            <div className={styles.starHouseText}>
              <span className={styles.starHouseTitle}>בית השבוע</span>
              <span className={styles.starHouseName}>{starHouse.name}</span>
              {starHouse.sponsor && <span className={styles.starHouseSponsor}>בחסות {starHouse.sponsor}</span>}
            </div>
          </div>
        )}
        {taglines.map((t, i) => (
          <p key={i} className={styles.tagline}>{t}</p>
        ))}
        <div className={styles.sidebarFooter}>
          <a href="/takanon" target="_blank" rel="noopener noreferrer" className={styles.takanonLink}>תקנון</a>
          <span> | </span>
          <span>האתר מופעל ע״י חברת </span>
          <a href="https://wa.me/972545779917?text=%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%95%D7%93%20%D7%A2%D7%9C%20%D7%9E%D7%99%D7%A0%D7%99%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C" target="_blank" rel="noopener noreferrer" className={styles.sidebarFooterPhone}>054-5779917</a>
          <span> | </span>
          <a href="https://www.stealthcode.co/" target="_blank" rel="noopener noreferrer" className={styles.sidebarFooterLink}>stealthCode</a>
        </div>
      </div>

      {composeTarget && (
        <div className={styles.composeBackdrop}>
          <div className={styles.composeModal}>
            <p className={styles.composeTitle}>הודעה ל{composeTarget.ownerName}</p>
            {storedUser?.inventory?.length > 0 && (
              <div>
                <p className={styles.composeLabel}>שלח פריט (אופציונלי):</p>
                <div className={styles.inventoryGrid}>
                  {storedUser.inventory.map((item, i) => (
                    <button
                      key={i}
                      className={`${styles.inventoryItem} ${composeItemIndex === i ? styles.inventoryItemSelected : ""}`}
                      onClick={() => setComposeItemIndex(composeItemIndex === i ? null : i)}
                      title={item.name}
                    >
                      {item.img ? <img src={item.img} alt={item.name} style={{ width: 24, height: 24, objectFit: "contain" }} /> : item.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <textarea
              className={styles.composeTextarea}
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder={composeItemIndex !== null ? "הוסף הודעה (אופציונלי)..." : "כתוב הודעה..."}
              rows={3}
            />
            {(() => {
              const poopCount = (storedUser?.inventory || []).filter((i) => i.id === "poop").length;
              return poopCount > 0 ? (
                <button className={styles.poopThrowBtn} onClick={handleThrowPoop} disabled={poopThrowing}>
                  {poopThrowing ? "זורק..." : `💩 זרוק קקי על הבית של ${composeTarget.ownerName}`}
                </button>
              ) : null;
            })()}
            <div className={styles.composeActions}>
              <button className={styles.composeSend} onClick={handleSendMessage} disabled={composeSending || (composeItemIndex === null && !composeText.trim())}>
                {composeSending ? "שולח..." : "שלח"}
              </button>
              <button className={styles.composeCancel} onClick={() => { setComposeTarget(null); setComposeItemIndex(null); }}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {showNameModal && (<NameModal name={nameInput} onChangeName={setNameInput} onSave={handleSaveName} />)}
      {showMissile && (<img src="/assets/missile.png" alt="" className={styles.missile} style={{ bottom: `${missileBottom}vh` }} />)}

      {showLotteryPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setShowLotteryPopup(false)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", maxWidth: 360, width: "90%", textAlign: "center", direction: "rtl", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎰</div>
            <h2 style={{ margin: "0 0 12px", fontSize: 20, color: "#1a1a1a" }}>הגרלה שבועית!</h2>
            <p style={{ margin: "0 0 20px", fontSize: 15, color: "#333", lineHeight: 1.6 }}>
              ביום שלישי הקרוב תיערך הגרלה על <strong>₪100 אמיתיים</strong>.<br />
              תנאי להשתתפות: הזמן/י 2 חברים.<br />
              <span style={{ fontSize: 13, color: "#666" }}>אין צורך להירשם</span>
            </p>
            <a
              href="https://wa.me/?text=%D7%91%D7%95%D7%90%D7%95%20%D7%9C%D7%A9%D7%97%D7%A7%20%D7%91%D7%9E%D7%99%D7%A0%D7%99%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C%21%20https%3A%2F%2Fwww.mini-israel.com%2F"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { const uid = storedUser?.firebaseUid; if (uid) fetch("/api/track/wa-click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid }) }); setShowLotteryPopup(false); }}
              style={{ display: "inline-block", background: "#25D366", color: "#fff", borderRadius: 12, padding: "12px 28px", fontSize: 16, fontWeight: 700, textDecoration: "none", marginBottom: 12 }}
            >
              📲 הזמן חברים בוואטסאפ
            </a>
            <br />
            <button
              onClick={() => setShowLotteryPopup(false)}
              style={{ background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer", marginTop: 4 }}
            >
              סגור
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
