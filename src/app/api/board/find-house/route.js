import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");
    const boardDoc = await db.collection("board").findOne({ _id: BOARD_ID });
    const cell = (boardDoc?.cells || []).find(
      (c) => c.building === "main-house" && c.ownerUid === uid
    );

    if (!cell) return NextResponse.json({ error: "House not found" }, { status: 404 });

    return NextResponse.json({ ok: true, row: cell.row, col: cell.col });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
