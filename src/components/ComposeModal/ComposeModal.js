import { useState } from "react";
import styles from "./ComposeModal.module.css";
import he from "../../lang/he";

export default function ComposeModal({
  composeTarget,
  storedUser,
  composeItemIndex,
  setComposeItemIndex,
  composeSending,
  poopThrowing,
  onSend,
  onThrowPoop,
  onClose,
}) {
  const [composeText, setComposeText] = useState("");

  if (!composeTarget) return null;

  const poopCount = (storedUser?.inventory || []).filter((i) => i.id === "poop").length;

  // Deduplicate inventory: one entry per item id, tracking count and first array index
  const uniqueItems = [];
  const seenIds = {};
  (storedUser?.inventory || []).forEach((item, i) => {
    if (item.id === "poop") return; // poop handled separately
    if (seenIds[item.id] === undefined) {
      seenIds[item.id] = uniqueItems.length;
      uniqueItems.push({ ...item, count: 1, firstIndex: i });
    } else {
      uniqueItems[seenIds[item.id]].count++;
    }
  });

  return (
    <div className={styles.composeBackdrop}>
      <div className={styles.composeModal}>
        <p className={styles.composeTitle}>{he.composeTitle(composeTarget.ownerName)}</p>
        {uniqueItems.length > 0 && (
          <div>
            <p className={styles.composeLabel}>{he.composeSendItem}</p>
            <div className={styles.inventoryGrid}>
              {uniqueItems.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.inventoryItem} ${composeItemIndex === item.firstIndex ? styles.inventoryItemSelected : ""}`}
                  onClick={() => setComposeItemIndex(composeItemIndex === item.firstIndex ? null : item.firstIndex)}
                  title={`${item.name}${item.count > 1 ? ` (${item.count})` : ""}`}
                  style={{ position: "relative" }}
                >
                  {item.img ? <img src={item.img} alt={item.name} style={{ width: 24, height: 24, objectFit: "contain" }} /> : item.emoji}
                  {item.count > 1 && (
                    <span className={styles.itemCountBadge}>{item.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        <textarea
          className={styles.composeTextarea}
          value={composeText}
          onChange={(e) => setComposeText(e.target.value)}
          placeholder={composeItemIndex !== null ? he.composeAddMessageOptional : he.composeWriteMessage}
          rows={3}
        />
        {poopCount > 0 && (
          <button className={styles.poopThrowBtn} onClick={onThrowPoop} disabled={poopThrowing}>
            {poopThrowing ? he.composeThrowing : he.composeThrowPoop(composeTarget.ownerName)}
          </button>
        )}
        <div className={styles.composeActions}>
          <button className={styles.composeSend} onClick={() => onSend(composeText)} disabled={composeSending || (composeItemIndex === null && !composeText.trim())}>
            {composeSending ? he.composeSending : he.composeSend}
          </button>
          <button className={styles.composeCancel} onClick={onClose}>{he.composeCancel}</button>
        </div>
      </div>
    </div>
  );
}
