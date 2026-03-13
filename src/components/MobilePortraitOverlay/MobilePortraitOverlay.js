import styles from "./MobilePortraitOverlay.module.css";
import he from "../../lang/he";

export default function MobilePortraitOverlay({ show }) {
  if (!show) return null;

  return (
    <div className={styles.overlay}>
      {he.mobilePortraitMessage}
    </div>
  );
}
