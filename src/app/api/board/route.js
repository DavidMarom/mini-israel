import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 30;
const COLS = 15;
const APPLE_COUNT = 10;

const AZRIELI_ROW = 4;
const AZRIELI_COL = 12;

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
    let cells = existing?.cells || [];

    const hasApples = cells.some((c) => c.item === "apple");
    const azrieliTiles = [
      { row: AZRIELI_ROW,     col: AZRIELI_COL },
      { row: AZRIELI_ROW,     col: AZRIELI_COL + 1 },
      { row: AZRIELI_ROW + 1, col: AZRIELI_COL },
      { row: AZRIELI_ROW + 1, col: AZRIELI_COL + 1 },
    ];
    const hasAzrieli = azrieliTiles.every((t) =>
      cells.some((c) => c.row === t.row && c.col === t.col && c.building === "azrieli")
    );

    if (!hasApples || !hasAzrieli) {
      if (!hasApples) {
        const apples = seedApples(cells);
        cells = [...cells, ...apples];
      }
      if (!hasAzrieli) {
        cells = cells.filter((c) => !azrieliTiles.some((t) => t.row === c.row && t.col === c.col));
        azrieliTiles.forEach((t) => cells.push({ row: t.row, col: t.col, building: "azrieli" }));
      }
      await board.updateOne(
        { _id: BOARD_ID },
        { $set: { rows: ROWS, cols: COLS, cells, updatedAt: new Date() } },
        { upsert: true }
      );
      return NextResponse.json({ _id: BOARD_ID, rows: ROWS, cols: COLS, cells }, { status: 200 });
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

