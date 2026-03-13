"use client";

import styles from "./NameModal.module.css";
import he from "../../lang/he";

export default function NameModal({ name, onChangeName, onSave }) {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>{he.nameModalTitle}</h2>
        <p className={styles.modalText}>
          {he.nameModalText}
        </p>
        <input
          className={styles.modalInput}
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder={he.nameModalPlaceholder}
        />
        <button className={styles.primaryButton} onClick={onSave}>
          {he.save}
        </button>
      </div>
    </div>
  );
}
