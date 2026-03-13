import styles from "./LotteryPopup.module.css";

export default function LotteryPopup({ show, onClose, storedUser }) {
  if (!show) return null;

  const handleWaClick = () => {
    const uid = storedUser?.firebaseUid;
    if (uid) fetch("/api/track/wa-click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid }) });
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>🎰</div>
        <h2 className={styles.title}>הגרלה שבועית!</h2>
        <p className={styles.body}>
          ביום שלישי הקרוב תיערך הגרלה על <strong>₪100 אמיתיים</strong>.<br />
          תנאי להשתתפות: הזמן/י 2 חברים.<br />
          <span className={styles.note}>אין צורך להירשם</span>
        </p>
        <a
          href="https://wa.me/?text=%D7%91%D7%95%D7%90%D7%95%20%D7%9C%D7%A9%D7%97%D7%A7%20%D7%91%D7%9E%D7%99%D7%A0%D7%99%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C%21%20https%3A%2F%2Fwww.mini-israel.com%2F"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWaClick}
          className={styles.waBtn}
        >
          📲 הזמן חברים בוואטסאפ
        </a>
        <br />
        <button onClick={onClose} className={styles.closeBtn}>סגור</button>
      </div>
    </div>
  );
}
