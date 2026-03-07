import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const COLLECTIBLE_ITEMS = {
  shirt: { id: "shirt", img: "/assets/items/shirt.png", name: "חולצה" },
};

export async function POST(req) {
  try {
    const { uid, itemId } = await req.json();
    const item = COLLECTIBLE_ITEMS[itemId];
    if (!uid || !item) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    const result = await db.collection("users").findOneAndUpdate(
      { uid },
      { $push: { inventory: { id: item.id, img: item.img, name: item.name } }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ ok: true, inventory: result.inventory || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
