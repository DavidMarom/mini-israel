"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./WanderingSheep.module.css";

const SHEEP_SIZE = 48;
const POOP_LIFETIME = 4000;
const POOP_INTERVAL = 3000;
const MOVE_INTERVAL = 50;
const SPEED = 2;

export default function WanderingSheep() {
  const [pos, setPos] = useState({ x: 200, y: 300 });
  const [flipped, setFlipped] = useState(false);
  const [poops, setPoops] = useState([]);
  const dirRef = useRef({ dx: SPEED, dy: SPEED * 0.6 });
  const poopIdRef = useRef(0);

  const changeDirection = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const speed = SPEED + Math.random() * 1.2;
    dirRef.current = {
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
    };
  }, []);

  // Movement
  useEffect(() => {
    changeDirection();
    const dirChangeTimer = setInterval(changeDirection, 2000 + Math.random() * 2000);

    const moveTimer = setInterval(() => {
      setPos((prev) => {
        const maxX = window.innerWidth - SHEEP_SIZE;
        const maxY = window.innerHeight - SHEEP_SIZE;
        let nx = prev.x + dirRef.current.dx;
        let ny = prev.y + dirRef.current.dy;

        if (nx <= 0 || nx >= maxX) {
          dirRef.current.dx *= -1;
          nx = Math.max(0, Math.min(maxX, nx));
        }
        if (ny <= 0 || ny >= maxY) {
          dirRef.current.dy *= -1;
          ny = Math.max(0, Math.min(maxY, ny));
        }

        setFlipped(dirRef.current.dx < 0);
        return { x: nx, y: ny };
      });
    }, MOVE_INTERVAL);

    return () => {
      clearInterval(moveTimer);
      clearInterval(dirChangeTimer);
    };
  }, [changeDirection]);

  // Poop dropping
  useEffect(() => {
    const poopTimer = setInterval(() => {
      setPos((current) => {
        const id = ++poopIdRef.current;
        setPoops((prev) => [...prev, { id, x: current.x + SHEEP_SIZE / 2 - 10, y: current.y + SHEEP_SIZE - 8 }]);
        setTimeout(() => {
          setPoops((prev) => prev.filter((p) => p.id !== id));
        }, POOP_LIFETIME);
        return current;
      });
    }, POOP_INTERVAL);

    return () => clearInterval(poopTimer);
  }, []);

  return (
    <div className={styles.container} aria-hidden="true">
      {poops.map((p) => (
        <span
          key={p.id}
          className={styles.poop}
          style={{ left: p.x, top: p.y }}
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
