import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";

const CC_UPGRADE_COSTS = {
  2: { cost: 1000, friendItems: [{ id: "falafel", count: 3 }] },
  3: { cost: 1500, friendItems: [{ id: "shirt", count: 2 }, { id: "flag", count: 1 }] },
  4: { cost: 2200, friendItems: [{ id: "shirt", count: 2 }, { id: "pc", count: 1 }] },
  5: { cost: 3500, friendItems: [{ id: "headphones", count: 3 }] },
};

export async function POST(request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    const boardCol = db.collection("board");
    const board = await boardCol.findOne({ _id: BOARD_ID });
    let cells = board?.cells || [];

    const ccIndex = cells.findIndex((c) => c.building === "community-center" && c.ownerUid === uid);
    if (ccIndex === -1) return NextResponse.json({ error: "No community center found" }, { status: 400 });

    const currentLevel = cells[ccIndex].ccLevel || 1;
    if (currentLevel >= 5) return NextResponse.json({ error: "Max level reached" }, { status: 400 });

    const newLevel = currentLevel + 1;
    const { cost, friendItems } = CC_UPGRADE_COSTS[newLevel];

    const user = await db.collection("users").findOne({ uid });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Validate friend items
    for (const { id, count } of friendItems) {
      const have = (user.inventory || []).filter((i) => i.id === id && i.fromFriend).length;
      if (have < count) {
        return NextResponse.json({ error: `Need friend ${id} x${count}` }, { status: 400 });
      }
    }

    // Atomically deduct cost
    const result = await db.collection("users").findOneAndUpdate(
      { uid, money: { $gte: cost } },
      { $inc: { money: -cost }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result) return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });

    // Consume friend items
    let updatedUser = await db.collection("users").findOne({ uid });
    for (const { id, count } of friendItems) {
      for (let i = 0; i < count; i++) {
        const idx = (updatedUser.inventory || []).findIndex((item) => item.id === id && item.fromFriend);
        if (idx !== -1) {
          await db.collection("users").updateOne({ uid }, { $unset: { [`inventory.${idx}`]: 1 } });
          await db.collection("users").updateOne({ uid }, { $pull: { inventory: null } });
          updatedUser = await db.collection("users").findOne({ uid });
        }
      }
    }

    // Update board cell
    cells = cells.map((c, i) => i === ccIndex ? { ...c, ccLevel: newLevel } : c);
    await boardCol.updateOne({ _id: BOARD_ID }, { $set: { cells, updatedAt: new Date() } });

    return NextResponse.json({ ok: true, money: result.money, ccLevel: newLevel, inventory: updatedUser.inventory });
  } catch (error) {
    console.error("Error in POST /api/community-center/upgrade", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
