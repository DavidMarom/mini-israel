"use client";

import { useState } from "react";
import styles from "./AuthCard.module.css";

export default function AuthCard({ loading, user, displayName, bio, money, inventory, photoURL, onGoogleSignIn, onLogout, error, onUpdateName }) {

  const [avatarBroken, setAvatarBroken] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(displayName || "");
  const [editedBio, setEditedBio] = useState(bio || "");

  const handleStartEdit = () => {
    setEditedName(displayName || "");
    setEditedBio(bio || "");
    setIsEditingName(true);
  };

  const handleSaveEdit = async () => {
    if (!onUpdateName) {
      setIsEditingName(false);
      return;
    }

    const success = await onUpdateName(editedName, editedBio);
    if (success) {
      setIsEditingName(false);
    }
  };

  return (
    <div className={styles.card}>
      {loading && <p className={styles.text}>טוען...</p>}

      {!loading && !user && (
        <>
          <p className={styles.text}>התחבר/י כדי להתחיל לשחק</p>
          <button onClick={onGoogleSignIn} className={styles.primaryButton}>התחבר/י</button>
        </>
      )}

      {!loading && user && (
        <>
          <div className={styles.userRow}>
            {photoURL && !avatarBroken ? (
              <img src={photoURL} alt={displayName || "Player avatar"} className={styles.avatar} referrerPolicy="no-referrer" onError={() => setAvatarBroken(true)} />
            ) : (
              <div className={styles.avatarFallback}>{(displayName || "?").charAt(0)}</div>
            )}

            {isEditingName ? (
              <div className={styles.nameEditColumn}>
                <input className={styles.nameInput} value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="שם תצוגה" />
                <textarea className={styles.bioInput} value={editedBio} onChange={(e) => setEditedBio(e.target.value)} placeholder="ביו..." rows={2} />
                <button type="button" className={styles.saveNameButton} onClick={handleSaveEdit}>שמור</button>
              </div>
            ) : (
              <div className={styles.nameRow}>
                <p className={styles.text}>{displayName}</p>
                <button type="button" className={styles.editButton} onClick={handleStartEdit} aria-label="עריכת שם">✎</button>
              </div>
            )}
          </div>

          {!isEditingName && bio && (
            <p className={styles.bio}>{bio}</p>
          )}

          <p className={styles.balanceText}>מטבעות: <span className={styles.balanceValue}>{money ?? 0}</span> שקלים</p>

          {inventory && inventory.length > 0 && (
            <div className={styles.inventorySection}>
              <p className={styles.inventoryTitle}>חפצים:</p>
              <div className={styles.inventoryItems}>
                {Object.values(
                  inventory.reduce((acc, item) => {
                    const key = item.id;
                    if (!acc[key]) acc[key] = { ...item, count: 0 };
                    acc[key].count += 1;
                    return acc;
                  }, {})
                ).map((item) => (
                  <span key={item.id} className={styles.inventoryItem}>
                    {item.img
                      ? <img src={item.img} alt={item.name} style={{ width: 18, height: 18, objectFit: "contain", verticalAlign: "middle" }} />
                      : item.emoji
                    }
                    {item.count > 1 ? ` ×${item.count}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={onLogout} className={styles.secondaryButton}>התנתק</button>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
