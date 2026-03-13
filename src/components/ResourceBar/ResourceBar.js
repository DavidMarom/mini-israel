import styles from "./ResourceBar.module.css";

export default function ResourceBar({ money }) {
  if (money == null) return null;

  return (
    <div className={styles.resourceBar}>
      <div className={styles.resourcePill}>
        <span className={styles.resourceIcon}>🪙</span>
        <span className={styles.resourceValue}>{(money ?? 0).toLocaleString()}</span>
      </div>
    </div>
  );
}
