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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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
        האתר בנוי לשימוש בטאבלט או מחשב
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
        <p className={styles.tagline}>מיני ישראל מתחדשת כל הזמן! בכל יום פריטים חדשים ויכולות נוספות...</p>
        <p className={styles.tagline}>אפשר לשלוח הודעות למשתמשים אחרים על ידי לחיצה על הבית שלהם</p>
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

    </div>
  );
}
