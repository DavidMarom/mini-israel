import styles from "./MobilePortraitOverlay.module.css";

export default function MobilePortraitOverlay({ show }) {
  if (!show) return null;

  return (
    <div className={styles.overlay}>
      סובב את המכשיר לאופק כדי לשחק במיני ישראל
    </div>
  );
}
