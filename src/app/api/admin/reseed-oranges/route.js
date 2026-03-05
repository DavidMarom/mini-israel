import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 230;
const COLS = 15;
const ORANGE_COUNT = 10;

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const board = db.collection("board");

    const existing = await board.findOne({ _id: BOARD_ID });
    const allCells = existing?.cells || [];

    const nonOrangeCells = allCells.filter((c) => c.item !== "orange");
    const occupied = new Set(nonOrangeCells.map((c) => `${c.row}-${c.col}`));

    const oranges = [];
    while (oranges.length < ORANGE_COUNT) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      const key = `${row}-${col}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        oranges.push({ row, col, item: "orange" });
      }
    }

    const newCells = [...nonOrangeCells, ...oranges];
    await board.updateOne(
      { _id: BOARD_ID },
      { $set: { rows: ROWS, cols: COLS, cells: newCells, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, oranges: oranges.length });
  } catch (error) {
    console.error("Error in POST /api/admin/reseed-oranges", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
