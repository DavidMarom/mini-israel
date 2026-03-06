import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 230;
const COLS = 15;

export async function POST(req) {
  try {
    const { row, col, sponsor } = await req.json();

    const r = row != null ? Number(row) : Math.floor(Math.random() * ROWS);
    const c = col != null ? Number(col) : Math.floor(Math.random() * COLS);

    const client = await clientPromise;
    const db = client.db("main");

    const board = await db.collection("board").findOne({ _id: BOARD_ID });
    const cells = (board?.cells || []).filter(
      (cell) => cell.item !== "treasure"
    );
    cells.push({ row: r, col: c, item: "treasure", building: null, ownerUid: null, ownerName: null });

    await db.collection("board").updateOne(
      { _id: BOARD_ID },
      { $set: { cells, updatedAt: new Date() } },
      { upsert: true }
    );

    await db.collection("config").updateOne(
      { _id: "treasure_sponsor" },
      { $set: { text: sponsor || null, updatedAt: new Date() } },
      { upsert: true }
    );

    await db.collection("config").deleteOne({ _id: "treasure_winner" });

    return NextResponse.json({ ok: true, row: r, col: c });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
