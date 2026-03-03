"use client";

import { useState } from "react";
import styles from "./GameBoard.module.css";

const ROWS = 30;
const COLS = 15;

const createInitialGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(false));

export default function GameBoard() {
  const [selected, setSelected] = useState(createInitialGrid);

  const handleClick = (row, col) => {
    setSelected((prev) => {
      if (prev[row][col]) return prev;
      const next = prev.map((r) => r.slice());
      next[row][col] = true;
      return next;
    });
  };

  return (
    <div className={styles.board}>
      {Array.from({ length: ROWS }).map((_, row) =>
        Array.from({ length: COLS }).map((_, col) => {
          const key = `${row}-${col}`;
          const isSelected = selected[row][col];

          return (
            <div
              key={key}
              className={`${styles.tile} ${
                isSelected ? styles.tileSelected : ""
              }`}
              onClick={() => handleClick(row, col)}
            />
          );
        })
      )}
    </div>
  );
}


