import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";

export async function POST(req) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    const boardDoc = await db.collection("board").findOne({ _id: BOARD_ID });
    const cells = boardDoc?.cells || [];
    const houseIdx = cells.findIndex((c) => c.building === "main-house" && c.ownerUid === uid && c.pooped);

    if (houseIdx === -1) return NextResponse.json({ error: "No pooped house found" }, { status: 404 });

    const { pooped, ...cleanCell } = cells[houseIdx];
    cells[houseIdx] = cleanCell;

    await db.collection("board").updateOne(
      { _id: BOARD_ID },
      { $set: { cells, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
