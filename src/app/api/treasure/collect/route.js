import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const TREASURE_COINS = 200;

export async function POST(req) {
  try {
    const { uid, name, row, col } = await req.json();
    if (!uid || row == null || col == null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const board = await db.collection("board").findOne({ _id: BOARD_ID });
    const cells = board?.cells || [];
    const treasureIndex = cells.findIndex(
      (c) => c.row === Number(row) && c.col === Number(col) && c.item === "treasure"
    );

    if (treasureIndex === -1) {
      return NextResponse.json({ error: "Treasure already claimed" }, { status: 409 });
    }

    const newCells = cells.filter((_, i) => i !== treasureIndex);
    await db.collection("board").updateOne(
      { _id: BOARD_ID },
      { $set: { cells: newCells, updatedAt: new Date() } }
    );

    const user = await db.collection("users").findOne({ uid });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newMoney = (user.money || 0) + TREASURE_COINS;
    await db.collection("users").updateOne(
      { uid },
      { $set: { money: newMoney, updatedAt: new Date() } }
    );

    const sponsorDoc = await db.collection("config").findOne({ _id: "treasure_sponsor" });

    await db.collection("config").updateOne(
      { _id: "treasure_winner" },
      { $set: { name: name || uid, uid, claimedAt: new Date(), sponsor: sponsorDoc?.text || null } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, money: newMoney, coins: TREASURE_COINS, sponsor: sponsorDoc?.text || null });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
