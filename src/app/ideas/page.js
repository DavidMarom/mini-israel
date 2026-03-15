"use client";

import { useState } from "react";
import styles from "./ideas.module.css";

export default function IdeasPage() {
  const [form, setForm] = useState({ name: "", idea: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/feature-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "שגיאה, נסה שוב.");
        return;
      }
      setSent(true);
    } catch {
      setError("שגיאה בשליחה, נסה שוב.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <a href="/" className={styles.back}>← חזור למיני ישראל</a>

        <div className={styles.header}>
          <h1 className={styles.title}>רעיונות לפיצ'רים</h1>
          <p className={styles.subtitle}>
            יש לך רעיון לפיצ'ר חדש במיני ישראל?
            כתוב פה, והבינה המלאכותית תכניס אותו אוטומטית למשחק!!!
          </p>
        </div>

        {sent ? (
          <div className={styles.success}>
            <span className={styles.successIcon}>💡</span>
            <p className={styles.successText}>תודה! הרעיון שלך התקבל.</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>שם (אופציונלי)</label>
              <input
                className={styles.input}
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="ישראל ישראלי"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>הרעיון שלך *</label>
              <textarea
                className={styles.textarea}
                value={form.idea}
                onChange={set("idea")}
                placeholder="תאר את הפיצ'ר שהיית רוצה לראות במשחק..."
                rows={5}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.submit} type="submit" disabled={sending}>
              {sending ? "שולח..." : "שלח רעיון"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
