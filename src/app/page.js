"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { auth } from "../services/fb";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, } from "firebase/auth";
import { GameBoard, NameModal, AuthCard, MessagesCard } from "../components";
import useUserStore from "../store/useUserStore";

const provider = new GoogleAuthProvider();

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [taglines, setTaglines] = useState([]);
  const [showMissile, setShowMissile] = useState(false);
  const [missileBottom, setMissileBottom] = useState(30);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fireMissile = () => {
      setMissileBottom(10 + Math.random() * 60);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [composeTarget, setComposeTarget] = useState(null); // { ownerUid, ownerName }
  const [composeText, setComposeText] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeItemIndex, setComposeItemIndex] = useState(null);

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

  if (isMobile) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", textAlign: "center", padding: "2rem", fontSize: "1.5rem", direction: "rtl" }}>
        סובב את המכשיר לאופק כדי לשחק במיני ישראל!
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.boardLayer}>
        <GameBoard onOtherHouseClick={(target) => { setComposeTarget(target); setComposeText(""); setComposeItemIndex(null); }} />
      </div>

      <div className={styles.overlay}>
        <div className={styles.siteHeader}>
          <img src="/assets/main-house.png" alt="מיני ישראל" className={styles.siteLogo} />
          <span className={styles.siteTitle}>מיני ישראל</span>
          <a
            href="https://wa.me/?text=%D7%91%D7%95%D7%90%D7%95%20%D7%9C%D7%A9%D7%97%D7%A7%20%D7%91%D7%9E%D7%99%D7%A0%D7%99%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C%21%20https%3A%2F%2Fwww.mini-israel.com%2F"
            className={styles.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            title="שתף בוואטסאפ"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={styles.whatsappIcon} fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <a href="/takanon" className={styles.takanonLink} target="_blank" rel="noopener noreferrer">תקנון</a>
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
        />
        <MessagesCard user={storedUser} />
        {taglines.map((t, i) => (
          <p key={i} className={styles.tagline}>{t}</p>
        ))}
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
                      {item.emoji}
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

      {showMissile && (
        <img
          src="/assets/missile.png"
          alt=""
          className={styles.missile}
          style={{ bottom: `${missileBottom}vh` }}
        />
      )}

    </div>
  );
}
