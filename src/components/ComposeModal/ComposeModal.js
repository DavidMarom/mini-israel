import styles from "./ComposeModal.module.css";

export default function ComposeModal({
  composeTarget,
  storedUser,
  composeText,
  setComposeText,
  composeItemIndex,
  setComposeItemIndex,
  composeSending,
  poopThrowing,
  onSend,
  onThrowPoop,
  onClose,
}) {
  if (!composeTarget) return null;

  const poopCount = (storedUser?.inventory || []).filter((i) => i.id === "poop").length;

  return (
    <div className={styles.composeBackdrop}>
      <div className={styles.composeModal}>
        <p className={styles.composeTitle}>הודעה ל{composeTarget.ownerName}</p>
        {storedUser?.inventory?.length > 0 && (
          <div>
            <p className={styles.composeLabel}>שלח פריט (אופציונלי):</p>
            <div className={styles.inventoryGrid}>
              {storedUser.inventory.map((item, i) => (
                <button
                  key={i}
                  className={`${styles.inventoryItem} ${composeItemIndex === i ? styles.inventoryItemSelected : ""}`}
                  onClick={() => setComposeItemIndex(composeItemIndex === i ? null : i)}
                  title={item.name}
                >
                  {item.img ? <img src={item.img} alt={item.name} style={{ width: 24, height: 24, objectFit: "contain" }} /> : item.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        <textarea
          className={styles.composeTextarea}
          value={composeText}
          onChange={(e) => setComposeText(e.target.value)}
          placeholder={composeItemIndex !== null ? "הוסף הודעה (אופציונלי)..." : "כתוב הודעה..."}
          rows={3}
        />
        {poopCount > 0 && (
          <button className={styles.poopThrowBtn} onClick={onThrowPoop} disabled={poopThrowing}>
            {poopThrowing ? "זורק..." : `💩 זרוק קקי על הבית של ${composeTarget.ownerName}`}
          </button>
        )}
        <div className={styles.composeActions}>
          <button className={styles.composeSend} onClick={onSend} disabled={composeSending || (composeItemIndex === null && !composeText.trim())}>
            {composeSending ? "שולח..." : "שלח"}
          </button>
          <button className={styles.composeCancel} onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}
