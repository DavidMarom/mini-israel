"use client";

import styles from "./NameModal.module.css";

export default function NameModal({ name, onChangeName, onSave }) {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>בחר שם לשחקן</h2>
        <p className={styles.modalText}>
          זה השם שיופיע לשחקנים אחרים בעולם.
        </p>
        <input
          className={styles.modalInput}
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="השם שלך"
        />
        <button className={styles.primaryButton} onClick={onSave}>
          שמור
        </button>
      </div>
    </div>
  );
}

