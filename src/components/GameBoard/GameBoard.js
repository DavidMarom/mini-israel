"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./GameBoard.module.css";
import useUserStore from "../../store/useUserStore";

const ROWS = 30;
const COLS = 15;
const TILE_SIZE = 64;

const AD_ROW = 7;
const AD_COL = 6;
const AD_W = 3;
const AD_H = 2;

const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export default function GameBoard({ onOtherHouseClick }) {
  const [grid, setGrid] = useState(createEmptyGrid);
  const [hover, setHover] = useState(null);
  const [houseTooltip, setHouseTooltip] = useState(null); // { x, y, ownerName, bio }
  const tooltipTimer = useRef(null);
  const { user, setUser, setMainHouse, needsHousePlacement } = useUserStore();

  const [ads, setAds] = useState([]);
  const [adIndex, setAdIndex] = useState(0);
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [adText, setAdText] = useState("");
  const [adSubmitting, setAdSubmitting] = useState(false);
  const adTimerRef = useRef(null);

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
                item: cell.item || null,
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

  const loadAds = () => {
    fetch("/api/ads")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.ads)) setAds(data.ads);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    adTimerRef.current = setInterval(() => {
      setAdIndex((i) => (i + 1) % ads.length);
    }, 7000);
    return () => clearInterval(adTimerRef.current);
  }, [ads.length]);

  const persistBoard = async (g) => {
    const cells = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = g[row][col];
        if (cell && (cell.building || cell.item)) {
          cells.push({
            row,
            col,
            building: cell.building || null,
            ownerUid: cell.ownerUid || null,
            ownerName: cell.ownerName || null,
            item: cell.item || null,
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

  // Keep house labels in sync when the user's name changes
  useEffect(() => {
    if (!user) return;
    const ownerUid = user.firebaseUid || user.uid;
    if (!ownerUid || !user.name) return;

    let updated = null;
    setGrid((prev) => {
      let changed = false;
      const next = prev.map((row) =>
        row.map((cell) => {
          if (
            cell &&
            cell.building === "main-house" &&
            cell.ownerUid === ownerUid &&
            cell.ownerName !== user.name
          ) {
            changed = true;
            return { ...cell, ownerName: user.name };
          }
          return cell;
        })
      );
      updated = changed ? next : null;
      return changed ? next : prev;
    });

    if (updated) {
      void persistBoard(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user && user.name]);

  const handleClick = (row, col) => {
    if (!user) return;
    const ownerUid = user.firebaseUid || user.uid;
    if (!ownerUid) return;

    const cell = grid[row][col];

    // Collecting an apple
    if (cell && cell.item === "apple") {
      const next = grid.map((r) => r.slice());
      next[row][col] = null;
      setGrid(next);
      void persistBoard(next);

      fetch("/api/user/money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid, amount: 10 }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (typeof data.money === "number") {
            setUser((prev) => ({ ...prev, money: data.money }));
          }
        })
        .catch(console.error);

      return;
    }

    // Clicking another user's house → open message compose
    if (cell && cell.building === "main-house" && cell.ownerUid !== ownerUid) {
      onOtherHouseClick && onOtherHouseClick({ ownerUid: cell.ownerUid, ownerName: cell.ownerName });
      return;
    }

    // When guiding right after signup, enforce placement only in that mode
    if (needsHousePlacement === true) {
      // ok, we are in placement mode
    } else {
      // Outside explicit placement mode, only allow if user has no main house yet
      const hasHouseAlready = grid.some((r) =>
        r.some(
          (cell) =>
            cell &&
            cell.building === "main-house" &&
            cell.ownerUid === ownerUid
        )
      );
      if (hasHouseAlready) return;
    }

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

  const handleHouseMouseEnter = (e, cell) => {
    const rect = e.currentTarget.getBoundingClientRect();
    tooltipTimer.current = setTimeout(async () => {
      let bio = null;
      try {
        const res = await fetch(`/api/user/profile?uid=${cell.ownerUid}`);
        const data = await res.json();
        bio = data.bio || null;
      } catch (_) {}
      setHouseTooltip({
        x: rect.left + rect.width / 2,
        y: rect.top,
        ownerName: cell.ownerName,
        bio,
      });
    }, 1000);
  };

  const handleHouseMouseLeave = () => {
    clearTimeout(tooltipTimer.current);
    setHouseTooltip(null);
  };

  const handleSubmitAd = async () => {
    if (!adText.trim() || !user) return;
    const ownerUid = user.firebaseUid || user.uid;
    setAdSubmitting(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: ownerUid, text: adText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error === "Insufficient funds" ? "אין מספיק כסף" : "שגיאה, נסה שוב");
        return;
      }
      if (typeof data.money === "number") {
        setUser((prev) => ({ ...prev, money: data.money }));
      }
      loadAds();
      setAdText("");
      setShowAdPopup(false);
    } catch (err) {
      console.error(err);
      alert("שגיאה, נסה שוב");
    } finally {
      setAdSubmitting(false);
    }
  };

  return (
    <>
      {houseTooltip && (
        <div
          className={styles.houseTooltip}
          style={{ left: houseTooltip.x, top: houseTooltip.y }}
        >
          <span className={styles.houseTooltipName}>{houseTooltip.ownerName}</span>
          {houseTooltip.bio && <span className={styles.houseTooltipBio}>{houseTooltip.bio}</span>}
        </div>
      )}
      <div className={styles.board}>
        {Array.from({ length: ROWS }).map((_, row) =>
          Array.from({ length: COLS }).map((_, col) => {
            const key = `${row}-${col}`;
            const cell = grid[row][col];
            const hasMainHouse = cell && cell.building === "main-house";
            const hasApple = cell && cell.item === "apple";
            const isEmpty = !cell;
            const ownerUid = user && (user.firebaseUid || user.uid);
            const userHasHouse =
              !!ownerUid &&
              grid.some((r) =>
                r.some(
                  (c) =>
                    c &&
                    c.building === "main-house" &&
                    c.ownerUid === ownerUid
                )
              );
            const canPreview =
              !!user &&
              !!ownerUid &&
              needsHousePlacement === true &&
              !userHasHouse &&
              isEmpty;

            return (
              <div
                key={key}
                className={styles.tile}
                onClick={() => handleClick(row, col)}
                onMouseEnter={(e) => {
                  setHover({ row, col });
                  if (hasMainHouse) handleHouseMouseEnter(e, cell);
                }}
                onMouseLeave={() => {
                  setHover((prev) =>
                    prev && prev.row === row && prev.col === col ? null : prev
                  );
                  if (hasMainHouse) handleHouseMouseLeave();
                }}
              >
                {hasApple && (
                  <span className={styles.apple}>🍎</span>
                )}
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
                {!hasMainHouse &&
                  canPreview &&
                  hover &&
                  hover.row === row &&
                  hover.col === col && (
                    <div className={styles.houseWrapper}>
                      <img
                        src="/assets/main-house.png"
                        alt="מיקום בית ראשי"
                        className={styles.mainHouse}
                      />
                    </div>
                  )}
              </div>
            );
          })
        )}

        {/* Advertisement Board */}
        <div
          className={styles.adBoard}
          style={{
            top: AD_ROW * TILE_SIZE,
            left: AD_COL * TILE_SIZE,
            width: AD_W * TILE_SIZE,
            height: AD_H * TILE_SIZE,
          }}
        >
          {user && (
            <button
              className={styles.adAddBtn}
              onClick={() => setShowAdPopup(true)}
              title="הוסף פרסומת"
            >
              +
            </button>
          )}
          <div className={styles.adContent}>
            {ads.length > 0 ? (
              <span className={styles.adText}>{ads[adIndex]?.text}</span>
            ) : (
              <span className={styles.adEmptyText}>פרסם כאן!</span>
            )}
          </div>
        </div>
      </div>

      {/* Ad Submission Popup */}
      {showAdPopup && (
        <div className={styles.adPopupBackdrop}>
          <div className={styles.adPopupModal}>
            <p className={styles.adPopupTitle}>הוסף פרסומת</p>
            <textarea
              className={styles.adPopupTextarea}
              value={adText}
              onChange={(e) => setAdText(e.target.value)}
              placeholder="טקסט הפרסומת..."
              rows={3}
              maxLength={120}
            />
            <p className={styles.adPopupInfo}>עולה 100 מטבעות. הפרסום ישאר בלוח שבוע אחד.</p>
            <div className={styles.adPopupActions}>
              <button
                className={styles.adPopupSubmit}
                onClick={handleSubmitAd}
                disabled={adSubmitting || !adText.trim()}
              >
                {adSubmitting ? "שולח..." : "פרסם"}
              </button>
              <button
                className={styles.adPopupCancel}
                onClick={() => { setShowAdPopup(false); setAdText(""); }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
