"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./WanderingSheep.module.css";

const SHEEP_SIZE = 48;
const POOP_LIFETIME = 4000;
const POOP_INTERVAL = 3000;
const MOVE_INTERVAL = 50;
const SPEED = 2;

export default function WanderingSheep({ boardRef, onPoopCollect }) {
  const [pos, setPos] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [poops, setPoops] = useState([]);
  const dirRef = useRef({ dx: SPEED, dy: SPEED * 0.6 });
  const poopIdRef = useRef(0);

  const getBounds = useCallback(() => {
    if (boardRef?.current) {
      const rect = boardRef.current.getBoundingClientRect();
      return {
        minX: rect.left,
        minY: rect.top,
        maxX: rect.right - SHEEP_SIZE,
        maxY: rect.bottom - SHEEP_SIZE,
      };
    }
    return {
      minX: 0,
      minY: 0,
      maxX: window.innerWidth - SHEEP_SIZE,
      maxY: window.innerHeight - SHEEP_SIZE,
    };
  }, [boardRef]);

  const changeDirection = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const speed = SPEED + Math.random() * 1.2;
    dirRef.current = {
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
    };
  }, []);

  // Init position on board and start movement
  useEffect(() => {
    const init = () => {
      const bounds = getBounds();
      const midX = bounds.minX + (bounds.maxX - bounds.minX) * 0.5;
      const midY = bounds.minY + (bounds.maxY - bounds.minY) * 0.3;
      setPos({ x: midX, y: midY });
    };
    // Small delay so boardRef is mounted
    const t = setTimeout(init, 150);
    return () => clearTimeout(t);
  }, [getBounds]);

  // Movement
  useEffect(() => {
    if (!pos) return;

    changeDirection();
    const dirChangeTimer = setInterval(changeDirection, 2000 + Math.random() * 2000);

    const moveTimer = setInterval(() => {
      const b = getBounds();
      setPos((prev) => {
        if (!prev) return prev;
        let nx = prev.x + dirRef.current.dx;
        let ny = prev.y + dirRef.current.dy;

        if (nx <= b.minX || nx >= b.maxX) {
          dirRef.current.dx *= -1;
          nx = Math.max(b.minX, Math.min(b.maxX, nx));
        }
        if (ny <= b.minY || ny >= b.maxY) {
          dirRef.current.dy *= -1;
          ny = Math.max(b.minY, Math.min(b.maxY, ny));
        }

        setFlipped(dirRef.current.dx < 0);
        return { x: nx, y: ny };
      });
    }, MOVE_INTERVAL);

    return () => {
      clearInterval(moveTimer);
      clearInterval(dirChangeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!pos, changeDirection, getBounds]);

  // Poop dropping
  useEffect(() => {
    const poopTimer = setInterval(() => {
      setPos((current) => {
        if (!current) return current;
        const id = ++poopIdRef.current;
        setPoops((prev) => [
          ...prev,
          { id, x: current.x + SHEEP_SIZE / 2 - 10, y: current.y + SHEEP_SIZE - 8 },
        ]);
        setTimeout(() => {
          setPoops((prev) => prev.filter((p) => p.id !== id));
        }, POOP_LIFETIME);
        return current;
      });
    }, POOP_INTERVAL);

    return () => clearInterval(poopTimer);
  }, []);

  if (!pos) return null;

  return (
    <div className={styles.container} aria-hidden="true">
      {poops.map((p) => (
        <span
          key={p.id}
          className={styles.poop}
          style={{ left: p.x, top: p.y }}
          title="לחץ לאסוף קקי!"
          onClick={() => {
            setPoops((prev) => prev.filter((pp) => pp.id !== p.id));
            onPoopCollect?.();
          }}
        >
          💩
        </span>
      ))}
      <div
        className={`${styles.sheep} ${flipped ? styles.flipped : ""}`}
        style={{ left: pos.x, top: pos.y }}
        title="כבשה משוטטת"
      >
        🐑
      </div>
    </div>
  );
}
