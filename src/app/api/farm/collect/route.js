import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const BASE_EGG_REWARD = 20;
const HOUSE_EGG_BONUS = { 1: 0, 2: 5, 3: 10, 4: 20, 5: 35 };

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

    const farmLevel = cells[farmIndex].farmLevel || 1;
    const houseCell = cells.find((c) => c.building === "main-house" && c.ownerUid === uid);
    const houseBonus = HOUSE_EGG_BONUS[houseCell?.houseLevel || 1] ?? 0;
    let reward = BASE_EGG_REWARD * farmLevel + houseBonus;

    // Apply upgrade bonuses from user doc
    const userDoc = await db.collection("users").findOne({ uid }, { projection: { powerBoostExpiry: 1, isVIP: 1 } });
    if (userDoc) {
      if (userDoc.powerBoostExpiry && new Date(userDoc.powerBoostExpiry) > new Date()) {
        reward += 20;
      }
      if (userDoc.isVIP) {
        reward += 20;
      }
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
      { $inc: { money: reward }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, money: result.money, reward });
  } catch (error) {
    console.error("Error in POST /api/farm/collect", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
