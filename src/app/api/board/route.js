import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 30;
const COLS = 15;
const APPLE_COUNT = 10;

function seedApples(existingCells) {
  const occupied = new Set(existingCells.map((c) => `${c.row}-${c.col}`));
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
  return apples;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const board = db.collection("board");

    const existing = await board.findOne({ _id: BOARD_ID });
    const cells = existing?.cells || [];

    const hasApples = cells.some((c) => c.item === "apple");
    if (!hasApples) {
      const apples = seedApples(cells);
      const newCells = [...cells, ...apples];
      await board.updateOne(
        { _id: BOARD_ID },
        { $set: { rows: ROWS, cols: COLS, cells: newCells, updatedAt: new Date() } },
        { upsert: true }
      );
      return NextResponse.json({ _id: BOARD_ID, rows: ROWS, cols: COLS, cells: newCells }, { status: 200 });
    }

    return NextResponse.json(existing, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/board", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { rows, cols, cells } = body || {};

    if (
      typeof rows !== "number" ||
      typeof cols !== "number" ||
      !Array.isArray(cells)
    ) {
      return NextResponse.json(
        { error: "Invalid board payload" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("main");
    const board = db.collection("board");

    await board.updateOne(
      { _id: BOARD_ID },
      {
        $set: {
          rows,
          cols,
          cells,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/board", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

