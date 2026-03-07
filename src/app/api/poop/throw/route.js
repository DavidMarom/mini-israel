import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";

export async function POST(req) {
  try {
    const { uid, targetUid } = await req.json();
    if (!uid || !targetUid) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (uid === targetUid) return NextResponse.json({ error: "Cannot poop on yourself" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    // Verify thrower has poop in inventory
    const thrower = await db.collection("users").findOne({ uid });
    if (!thrower) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const poopIndex = (thrower.inventory || []).findIndex((item) => item.id === "poop");
    if (poopIndex === -1) return NextResponse.json({ error: "No poop in inventory" }, { status: 400 });

    // Remove one poop from inventory
    const newInventory = [...thrower.inventory];
    newInventory.splice(poopIndex, 1);
    await db.collection("users").updateOne({ uid }, { $set: { inventory: newInventory } });

    // Find target house on board and mark as pooped
    const boardDoc = await db.collection("board").findOne({ _id: BOARD_ID });
    const cells = boardDoc?.cells || [];
    const targetIdx = cells.findIndex((c) => c.building === "main-house" && c.ownerUid === targetUid);
    if (targetIdx === -1) return NextResponse.json({ error: "Target house not found" }, { status: 404 });

    cells[targetIdx] = { ...cells[targetIdx], pooped: true };
    await db.collection("board").updateOne(
      { _id: BOARD_ID },
      { $set: { cells, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true, inventory: newInventory });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
