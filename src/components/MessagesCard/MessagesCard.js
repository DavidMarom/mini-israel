"use client";

import { useEffect, useState } from "react";
import styles from "./MessagesCard.module.css";

export default function MessagesCard({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // { fromUid, fromName }
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

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

  const handleSendReply = async () => {
    if (!replyText.trim() || !replyTo || !user) return;
    setReplySending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUid: uid,
          fromName: user.name,
          toUid: replyTo.fromUid,
          toName: replyTo.fromName,
          text: replyText,
        }),
      });
      setReplyTo(null);
      setReplyText("");
    } catch (err) {
      console.error(err);
    } finally {
      setReplySending(false);
    }
  };

  if (!uid) return null;

  const unread = messages.filter((m) => !m.read).length;

  return (
    <>
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
                    <div className={styles.msgActions}>
                      <button
                        className={styles.replyBtn}
                        onClick={() => { setReplyTo({ fromUid: msg.fromUid, fromName: msg.fromName }); setReplyText(""); }}
                        aria-label="השב להודעה"
                      >↩</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(msg._id)} aria-label="מחק הודעה">🗑</button>
                    </div>
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

      {replyTo && (
        <div className={styles.replyBackdrop} onClick={() => setReplyTo(null)}>
          <div className={styles.replyModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.replyTitle}>השב ל{replyTo.fromName}</p>
            <textarea
              className={styles.replyTextarea}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="כתוב תשובה..."
              rows={4}
            />
            <div className={styles.replyActions}>
              <button className={styles.replySend} onClick={handleSendReply} disabled={replySending || !replyText.trim()}>
                {replySending ? "שולח..." : "שלח"}
              </button>
              <button className={styles.replyCancel} onClick={() => setReplyTo(null)}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
