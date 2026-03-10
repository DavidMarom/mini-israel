import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const UPGRADE_COSTS = { 2: 600, 3: 1200 };

export async function POST(request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    const boardCol = db.collection("board");
    const board = await boardCol.findOne({ _id: BOARD_ID });
    let cells = board?.cells || [];

    const farmIndex = cells.findIndex((c) => c.building === "farm" && c.ownerUid === uid);
    if (farmIndex === -1) return NextResponse.json({ error: "No farm found" }, { status: 400 });

    const currentLevel = cells[farmIndex].farmLevel || 1;
    if (currentLevel >= 3) return NextResponse.json({ error: "Max level reached" }, { status: 400 });

    const newLevel = currentLevel + 1;
    const cost = UPGRADE_COSTS[newLevel];

    const result = await db.collection("users").findOneAndUpdate(
      { uid, money: { $gte: cost } },
      { $inc: { money: -cost }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });

    cells = cells.map((c, i) => i === farmIndex ? { ...c, farmLevel: newLevel } : c);
    await boardCol.updateOne(
      { _id: BOARD_ID },
      { $set: { cells, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true, money: result.money, farmLevel: newLevel });
  } catch (error) {
    console.error("Error in POST /api/farm/upgrade", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
