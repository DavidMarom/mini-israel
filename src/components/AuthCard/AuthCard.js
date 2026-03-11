"use client";

import { useState } from "react";
import styles from "./AuthCard.module.css";

export default function AuthCard({ loading, user, displayName, bio, money, inventory, photoURL, onGoogleSignIn, onLogout, error, onUpdateName, onBuyFarm, hasFarm, buyingFarm, isVIP, onBuyVip }) {

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
          <a href="/horaot" target="_blank" rel="noopener noreferrer" className={styles.horaotLink}>📖 הוראות משחק</a>
        </>
      )}

      {!loading && user && (
        <>
          <button onClick={onLogout} className={styles.logoutBtn} aria-label="התנתק">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
              <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
          </button>
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
                {isVIP && <span className={styles.vipBadge}>👑 VIP</span>}
                <button type="button" className={styles.editButton} onClick={handleStartEdit} aria-label="עריכת שם">✎</button>
              </div>
            )}
          </div>

          {!isEditingName && bio && (
            <p className={styles.bio}>{bio}</p>
          )}

          <p className={styles.balanceText}>מטבעות: <span className={styles.balanceValue}>{money ?? 0}</span> 🪙</p>

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

          {!hasFarm && (
            <button
              onClick={onBuyFarm}
              className={styles.farmButton}
              disabled={buyingFarm || (money ?? 0) < 500}
            >
              {buyingFarm ? "קונה חווה..." : "🌾 קנה חווה – 500 🪙"}
            </button>
          )}

          {!isVIP && (
            <button
              onClick={onBuyVip}
              className={styles.vipButton}
              disabled={!onBuyVip || (money ?? 0) < 1500}
            >
              👑 שדרג ל-VIP – 1,500 🪙
            </button>
          )}

          <a href="/horaot" target="_blank" rel="noopener noreferrer" className={styles.horaotLink}>📖 הוראות משחק</a>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
