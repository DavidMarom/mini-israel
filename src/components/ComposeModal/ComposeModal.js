import { useState, useEffect } from "react";
import styles from "./ComposeModal.module.css";
import he from "../../lang/he";

const WEAPON_BUTTONS = {
  flamethrower: (name) => `🔥 שרוף את הבית של ${name}`,
  tank:         (name) => `🪖 הפצץ את הבית של ${name}`,
  rifle:        (name) => `🔫 בצע ירי על הבית של ${name}`,
  grenade:      (name) => `💣 זרוק רימון על הבית של ${name}`,
};

export default function ComposeModal({
  composeTarget,
  storedUser,
  composeItemIndex,
  setComposeItemIndex,
  composeSending,
  poopThrowing,
  weaponAttacking,
  onSend,
  onThrowPoop,
  onWeaponAttack,
  onClose,
}) {
  const [composeText, setComposeText] = useState("");
  const [targetMoney, setTargetMoney] = useState(null);

  useEffect(() => {
    if (!composeTarget) return;
    setTargetMoney(null);
    fetch(`/api/user/profile?uid=${composeTarget.ownerUid}`)
      .then((r) => r.json())
      .then((data) => { if (typeof data.money === "number") setTargetMoney(data.money); })
      .catch(() => {});
  }, [composeTarget?.ownerUid]);

  if (!composeTarget) return null;

  const inventory = storedUser?.inventory || [];
  const poopCount = inventory.filter((i) => i.id === "poop").length;

  // Weapons available for attack (one per weapon id with count > 0)
  const weaponCounts = {};
  inventory.forEach((item) => {
    if (WEAPON_BUTTONS[item.id]) weaponCounts[item.id] = (weaponCounts[item.id] || 0) + 1;
  });
  const availableWeapons = Object.keys(WEAPON_BUTTONS).filter((id) => weaponCounts[id] > 0);

  // Deduplicate non-weapon, non-poop inventory for gifting
  const uniqueItems = [];
  const seenIds = {};
  inventory.forEach((item, i) => {
    if (item.id === "poop" || WEAPON_BUTTONS[item.id]) return;
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
        {targetMoney !== null && (
          <p className={styles.targetMoney}>💰 {targetMoney} 🪙</p>
        )}
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
        {availableWeapons.map((weaponId) => (
          <button
            key={weaponId}
            className={styles.weaponAttackBtn}
            onClick={() => onWeaponAttack(weaponId)}
            disabled={!!weaponAttacking}
          >
            {weaponAttacking === weaponId ? "..." : WEAPON_BUTTONS[weaponId](composeTarget.ownerName)}
          </button>
        ))}
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
