"use client";

import { useState } from "react";
import styles from "./advertisers.module.css";

export default function AdvertisersPage() {
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/advertise", {
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
          <h1 className={styles.title}>פרסם במיני ישראל</h1>
          <p className={styles.subtitle}>
            מיני ישראל היא פלטפורמת משחק חברתית הצומחת במהירות.
            השאר פרטים ונחזור אליך עם הצעה מותאמת.
          </p>
        </div>

        <div className={styles.perks}>
          <div className={styles.perk}>
            <span className={styles.perkIcon}>🏆</span>
            <span>חסות למצעד העשירים</span>
          </div>
          <div className={styles.perk}>
            <span className={styles.perkIcon}>💎</span>
            <span>חסות לאוצר היומי</span>
          </div>
          <div className={styles.perk}>
            <span className={styles.perkIcon}>⭐</span>
            <span>חסות לבית השבוע</span>
          </div>
          <div className={styles.perk}>
            <span className={styles.perkIcon}>📢</span>
            <span>לוח פרסומות בלוח המשחק</span>
          </div>
        </div>

        {sent ? (
          <div className={styles.success}>
            <span className={styles.successIcon}>✅</span>
            <p className={styles.successText}>קיבלנו את פנייתך! נחזור אליך בהקדם.</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>שם מלא *</label>
                <input
                  className={styles.input}
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="ישראל ישראלי"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>חברה / עסק</label>
                <input
                  className={styles.input}
                  type="text"
                  value={form.company}
                  onChange={set("company")}
                  placeholder="שם העסק (אופציונלי)"
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>טלפון *</label>
                <input
                  className={styles.input}
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="050-0000000"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>אימייל</label>
                <input
                  className={styles.input}
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="email@example.com (אופציונלי)"
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>במה אתם מתעניינים? *</label>
              <textarea
                className={styles.textarea}
                value={form.message}
                onChange={set("message")}
                placeholder="ספרו לנו על העסק שלכם ואיזה סוג פרסום מעניין אתכם..."
                rows={4}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.submit} type="submit" disabled={sending}>
              {sending ? "שולח..." : "שלח פנייה"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
