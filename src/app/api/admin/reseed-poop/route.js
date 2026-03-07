import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 230;
const COLS = 15;
const POOP_COUNT = 10;

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const board = db.collection("board");

    const existing = await board.findOne({ _id: BOARD_ID });
    const allCells = existing?.cells || [];

    const nonPoopCells = allCells.filter((c) => c.item !== "poop");
    const occupied = new Set(nonPoopCells.map((c) => `${c.row}-${c.col}`));

    const poops = [];
    while (poops.length < POOP_COUNT) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      const key = `${row}-${col}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        poops.push({ row, col, item: "poop" });
      }
    }

    const newCells = [...nonPoopCells, ...poops];
    await board.updateOne(
      { _id: BOARD_ID },
      { $set: { rows: ROWS, cols: COLS, cells: newCells, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, count: poops.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
