import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const EGG_REWARD = 20;

export async function POST(request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    // Get board and find user's farm with a ready egg
    const boardCol = db.collection("board");
    const board = await boardCol.findOne({ _id: BOARD_ID });
    let cells = board?.cells || [];

    const farmIndex = cells.findIndex((c) => c.building === "farm" && c.ownerUid === uid && c.eggReady);
    if (farmIndex === -1) {
      return NextResponse.json({ error: "No egg to collect" }, { status: 400 });
    }

    // Mark egg as collected
    cells = cells.map((c, i) =>
      i === farmIndex ? { ...c, eggReady: false } : c
    );

    await boardCol.updateOne(
      { _id: BOARD_ID },
      { $set: { cells, updatedAt: new Date() } }
    );

    // Give user coins
    const result = await db.collection("users").findOneAndUpdate(
      { uid },
      { $inc: { money: EGG_REWARD }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, money: result.money });
  } catch (error) {
    console.error("Error in POST /api/farm/collect", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
