"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { auth } from "../services/fb";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, } from "firebase/auth";
import { GameBoard, NameModal, AuthCard, MessagesCard } from "../components";
import useUserStore from "../store/useUserStore";

const provider = new GoogleAuthProvider();

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [composeTarget, setComposeTarget] = useState(null); // { ownerUid, ownerName }
  const [composeText, setComposeText] = useState("");
  const [composeSending, setComposeSending] = useState(false);

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

  const saveName = async (newName) => {
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
    if (!composeText.trim() || !composeTarget || !storedUser) return;
    setComposeSending(true);
    try {
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
      setComposeTarget(null);
      setComposeText("");
    } catch (err) {
      console.error(err);
    } finally {
      setComposeSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.boardLayer}>
        <GameBoard onOtherHouseClick={(target) => { setComposeTarget(target); setComposeText(""); }} />
      </div>

      <div className={styles.overlay}>
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
          photoURL={user ? user.photoURL : null}
          onGoogleSignIn={handleGoogleSignIn}
          onLogout={handleLogout}
          error={error}
          onUpdateName={saveName}
        />
        <MessagesCard user={storedUser} />
      </div>

      {composeTarget && (
        <div className={styles.composeBackdrop}>
          <div className={styles.composeModal}>
            <p className={styles.composeTitle}>הודעה ל{composeTarget.ownerName}</p>
            <textarea
              className={styles.composeTextarea}
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder="כתוב הודעה..."
              rows={4}
            />
            <div className={styles.composeActions}>
              <button className={styles.composeSend} onClick={handleSendMessage} disabled={composeSending || !composeText.trim()}>
                {composeSending ? "שולח..." : "שלח"}
              </button>
              <button className={styles.composeCancel} onClick={() => setComposeTarget(null)}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {showNameModal && (<NameModal name={nameInput} onChangeName={setNameInput} onSave={handleSaveName} />)}

    </div>
  );
}
