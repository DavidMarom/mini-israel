"use client";

import { useEffect, useState } from "react";
import styles from "./MessagesCard.module.css";

export default function MessagesCard({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const uid = user && (user.firebaseUid || user.uid);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    fetch(`/api/messages?uid=${uid}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [uid]);

  const handleDelete = async (id) => {
    setMessages((prev) => prev.filter((m) => m._id !== id));
    try {
      await fetch(`/api/messages?id=${id}&uid=${uid}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
  };

  if (!uid) return null;

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className={styles.card}>
      <button className={styles.header} onClick={() => setExpanded((v) => !v)}>
        <span>הודעות</span>
        {unread > 0 && <span className={styles.badge}>{unread}</span>}
        <span className={styles.chevron}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className={styles.list}>
          {loading && <p className={styles.empty}>טוען...</p>}
          {!loading && messages.length === 0 && (
            <p className={styles.empty}>אין הודעות</p>
          )}
          {!loading &&
            messages.map((msg) => (
              <div key={msg._id} className={`${styles.message} ${!msg.read ? styles.unread : ""}`}>
                <div className={styles.messageTop}>
                  <span className={styles.from}>{msg.fromName}</span>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(msg._id)} aria-label="מחק הודעה">🗑</button>
                </div>
                <p className={styles.text}>{msg.text}</p>
                <span className={styles.time}>
                  {new Date(msg.createdAt).toLocaleDateString("he-IL", {
                    day: "numeric",
                    month: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
