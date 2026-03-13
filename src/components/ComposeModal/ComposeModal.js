import styles from "./ComposeModal.module.css";
import he from "../../lang/he";

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
        <p className={styles.composeTitle}>{he.composeTitle(composeTarget.ownerName)}</p>
        {storedUser?.inventory?.length > 0 && (
          <div>
            <p className={styles.composeLabel}>{he.composeSendItem}</p>
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
          placeholder={composeItemIndex !== null ? he.composeAddMessageOptional : he.composeWriteMessage}
          rows={3}
        />
        {poopCount > 0 && (
          <button className={styles.poopThrowBtn} onClick={onThrowPoop} disabled={poopThrowing}>
            {poopThrowing ? he.composeThrowing : he.composeThrowPoop(composeTarget.ownerName)}
          </button>
        )}
        <div className={styles.composeActions}>
          <button className={styles.composeSend} onClick={onSend} disabled={composeSending || (composeItemIndex === null && !composeText.trim())}>
            {composeSending ? he.composeSending : he.composeSend}
          </button>
          <button className={styles.composeCancel} onClick={onClose}>{he.composeCancel}</button>
        </div>
      </div>
    </div>
  );
}
