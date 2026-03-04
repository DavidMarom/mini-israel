import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 30;
const COLS = 15;
const APPLE_COUNT = 10;

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const board = db.collection("board");

    const existing = await board.findOne({ _id: BOARD_ID });
    const allCells = existing?.cells || [];

    // Keep only non-apple cells (houses etc.), then add fresh apples
    const nonAppleCells = allCells.filter((c) => c.item !== "apple");
    const occupied = new Set(nonAppleCells.map((c) => `${c.row}-${c.col}`));

    const apples = [];
    while (apples.length < APPLE_COUNT) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      const key = `${row}-${col}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        apples.push({ row, col, item: "apple" });
      }
    }

    const newCells = [...nonAppleCells, ...apples];
    await board.updateOne(
      { _id: BOARD_ID },
      { $set: { rows: ROWS, cols: COLS, cells: newCells, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, apples: apples.length });
  } catch (error) {
    console.error("Error in POST /api/admin/reseed-apples", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
