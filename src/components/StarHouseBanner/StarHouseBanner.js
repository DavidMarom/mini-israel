import styles from "./StarHouseBanner.module.css";
import he from "../../lang/he";

export default function StarHouseBanner({ starHouse }) {
  if (!starHouse) return null;

  return (
    <div className={styles.starHouseBanner}>
      <span className={styles.starHouseIcon}>⭐</span>
      <div className={styles.starHouseText}>
        <span className={styles.starHouseTitle}>{he.starHouseTitle}</span>
        <span className={styles.starHouseName}>{starHouse.name}</span>
        {starHouse.sponsor && <span className={styles.starHouseSponsor}>{he.starHouseSponsor(starHouse.sponsor)}</span>}
      </div>
    </div>
  );
}
