import styles from "./StarHouseBanner.module.css";

export default function StarHouseBanner({ starHouse }) {
  if (!starHouse) return null;

  return (
    <div className={styles.starHouseBanner}>
      <span className={styles.starHouseIcon}>⭐</span>
      <div className={styles.starHouseText}>
        <span className={styles.starHouseTitle}>בית השבוע</span>
        <span className={styles.starHouseName}>{starHouse.name}</span>
        {starHouse.sponsor && <span className={styles.starHouseSponsor}>בחסות {starHouse.sponsor}</span>}
      </div>
    </div>
  );
}
