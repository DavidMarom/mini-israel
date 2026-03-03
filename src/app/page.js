"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { auth } from "../services/fb";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import GameBoard from "../components/GameBoard";
import useUserStore from "../store/useUserStore";

const provider = new GoogleAuthProvider();

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const { user: storedUser, setUser: setUserStore, clearUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Ensure the user exists in MongoDB
        syncUserWithBackend(firebaseUser).catch((err) => {
          console.error("Failed to sync user with backend", err);
          setError("Could not save your profile. Please try again later.");
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
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
        };

        setUserStore(mergedUser);

        if (data.created) {
          setNameInput(mergedUser.name || "");
          setShowNameModal(true);
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
      setError("Google sign-in failed. Please try again.");
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
      setError("Failed to log out. Please try again.");
    }
  };

  const handleSaveName = async () => {
    if (!backendUser) return;
    const trimmed = nameInput.trim();
    if (!trimmed) return;

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

      setShowNameModal(false);
    } catch (err) {
      console.error(err);
      setError("Could not save your name. Please try again.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.boardLayer}>
        <GameBoard />
      </div>

      <div className={styles.overlay}>
        <div className={styles.card}>
        

        {loading && <p className={styles.text}>Loading...</p>}

        {!loading && !user && (
          <>
            <p className={styles.text}>
              Sign in with Google to create your village and start building.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className={styles.primaryButton}
            >
              Continue with Google
            </button>
          </>
        )}

        {!loading && user && (
          <>
            <div className={styles.userRow}>
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Player avatar"}
                  className={styles.avatar}
                />
              )}
              <div>
                <p className={styles.text}>
                  {storedUser?.name || user.displayName || user.email}
                </p>
              </div>
            </div>

            <button onClick={handleLogout} className={styles.secondaryButton}>
              Log out
            </button>
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}
        </div>

        {showNameModal && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>Choose your name</h2>
              <p className={styles.modalText}>
                This is how other players will see you in the world.
              </p>
              <input
                className={styles.modalInput}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
              />
              <button
                className={styles.primaryButton}
                onClick={handleSaveName}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
