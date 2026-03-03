"use client";

import { useEffect, useState } from "react";
import styles from "./GameBoard.module.css";
import useUserStore from "../store/useUserStore";

const ROWS = 30;
const COLS = 15;

const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export default function GameBoard() {
  const [grid, setGrid] = useState(createEmptyGrid);
  const { user, setMainHouse } = useUserStore();

  useEffect(() => {
    let cancelled = false;

    const loadBoard = async () => {
      try {
        const res = await fetch("/api/board");
        if (!res.ok) {
          throw new Error("Failed to load board");
        }
        const data = await res.json();

        if (!cancelled && Array.isArray(data.cells) && data.cells.length) {
          const g = createEmptyGrid();
          data.cells.forEach((cell) => {
            if (
              cell &&
              typeof cell.row === "number" &&
              typeof cell.col === "number" &&
              cell.row >= 0 &&
              cell.row < ROWS &&
              cell.col >= 0 &&
              cell.col < COLS
            ) {
              g[cell.row][cell.col] = {
                building: cell.building || null,
                ownerUid: cell.ownerUid || null,
                ownerName: cell.ownerName || null,
              };
            }
          });
          setGrid(g);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadBoard();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistBoard = async (g) => {
    const cells = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = g[row][col];
        if (cell && cell.building) {
          cells.push({
            row,
            col,
            building: cell.building,
            ownerUid: cell.ownerUid || null,
            ownerName: cell.ownerName || null,
          });
        }
      }
    }

    try {
      await fetch("/api/board", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: ROWS,
          cols: COLS,
          cells,
        }),
      });
    } catch (e) {
      console.error("Failed to save board", e);
    }
  };

  const handleClick = (row, col) => {
    if (!user) return;
    const ownerUid = user.firebaseUid || user.uid;
    if (!ownerUid) return;

    // Prevent more than one main house per user
    const alreadyHasHouse = grid.some((r) =>
      r.some(
        (cell) =>
          cell &&
          cell.building === "main-house" &&
          cell.ownerUid === ownerUid
      )
    );
    if (alreadyHasHouse) return;

    // Don't overwrite an occupied tile
    if (grid[row][col]) return;

    const next = grid.map((r) => r.slice());
    next[row][col] = {
      building: "main-house",
      ownerUid,
      ownerName: user.name || user.email,
    };

    setGrid(next);
    void persistBoard(next);
    setMainHouse({ row, col });
  };

  return (
    <div className={styles.board}>
      {Array.from({ length: ROWS }).map((_, row) =>
        Array.from({ length: COLS }).map((_, col) => {
          const key = `${row}-${col}`;
          const cell = grid[row][col];
          const hasMainHouse = cell && cell.building === "main-house";

          return (
            <div
              key={key}
              className={styles.tile}
              onClick={() => handleClick(row, col)}
            >
              {hasMainHouse && (
                <div className={styles.houseWrapper}>
                  <img
                    src="/assets/main-house.png"
                    alt="בית ראשי"
                    className={styles.mainHouse}
                  />
                  {cell.ownerName && (
                    <span className={styles.houseLabel}>{cell.ownerName}</span>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}



