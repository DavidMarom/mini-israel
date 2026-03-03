"use client";

import { useState } from "react";
import styles from "./AuthCard.module.css";

export default function AuthCard({
  loading,
  user,
  displayName,
  photoURL,
  onGoogleSignIn,
  onLogout,
  error,
  onUpdateName,
}) {
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(displayName || "");

  const handleStartEdit = () => {
    setEditedName(displayName || "");
    setIsEditingName(true);
  };

  const handleSaveEdit = async () => {
    if (!onUpdateName) {
      setIsEditingName(false);
      return;
    }

    const success = await onUpdateName(editedName);
    if (success) {
      setIsEditingName(false);
    }
  };

  return (
    <div className={styles.card}>
      {loading && <p className={styles.text}>טוען...</p>}

      {!loading && !user && (
        <>
          <p className={styles.text}>
            התחבר/י כדי להתחיל לשחק
          </p>
          <button onClick={onGoogleSignIn} className={styles.primaryButton}>
            התחבר/י
          </button>
        </>
      )}

      {!loading && user && (
        <>
          <div className={styles.userRow}>
            {photoURL && !avatarBroken ? (
              <img
                src={photoURL}
                alt={displayName || "Player avatar"}
                className={styles.avatar}
                referrerPolicy="no-referrer"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <div className={styles.avatarFallback}>
                {(displayName || "?").charAt(0)}
              </div>
            )}
            {isEditingName ? (
              <div className={styles.nameEditColumn}>
                <input
                  className={styles.nameInput}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.saveNameButton}
                  onClick={handleSaveEdit}
                >
                  שמור
                </button>
              </div>
            ) : (
              <div className={styles.nameRow}>
                <p className={styles.text}>{displayName}</p>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={handleStartEdit}
                  aria-label="עריכת שם"
                >
                  ✎
                </button>
              </div>
            )}
          </div>

          <button onClick={onLogout} className={styles.secondaryButton}>
            התנתק
          </button>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}


