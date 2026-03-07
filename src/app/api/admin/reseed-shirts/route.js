import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 230;
const COLS = 15;
const SHIRT_COUNT = 10;

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const board = db.collection("board");

    const existing = await board.findOne({ _id: BOARD_ID });
    const allCells = existing?.cells || [];

    const nonShirtCells = allCells.filter((c) => c.item !== "shirt");
    const occupied = new Set(nonShirtCells.map((c) => `${c.row}-${c.col}`));

    const shirts = [];
    while (shirts.length < SHIRT_COUNT) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      const key = `${row}-${col}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        shirts.push({ row, col, item: "shirt" });
      }
    }

    const newCells = [...nonShirtCells, ...shirts];
    await board.updateOne(
      { _id: BOARD_ID },
      { $set: { rows: ROWS, cols: COLS, cells: newCells, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, shirts: shirts.length });
  } catch (error) {
    console.error("Error in POST /api/admin/reseed-shirts", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
