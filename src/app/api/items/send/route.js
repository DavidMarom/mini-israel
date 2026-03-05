import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function POST(request) {
  try {
    const { fromUid, fromName, toUid, toName, itemIndex, text } = await request.json();

    if (!fromUid || !toUid || itemIndex === undefined || itemIndex === null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const sender = await db.collection("users").findOne({ uid: fromUid });
    if (!sender || !sender.inventory || !sender.inventory[itemIndex]) {
      return NextResponse.json({ error: "Item not found" }, { status: 400 });
    }

    const item = sender.inventory[itemIndex];

    // Remove item from sender by index (unset then pull nulls)
    await db.collection("users").updateOne(
      { uid: fromUid },
      { $unset: { [`inventory.${itemIndex}`]: 1 } }
    );
    await db.collection("users").updateOne(
      { uid: fromUid },
      { $pull: { inventory: null } }
    );

    // Add item to recipient
    await db.collection("users").updateOne(
      { uid: toUid },
      { $push: { inventory: item } }
    );

    const messageText = text?.trim()
      ? `${item.emoji} ${item.name}: ${text.trim()}`
      : `שלח לך ${item.emoji} ${item.name}`;

    await db.collection("messages").insertOne({
      fromUid,
      fromName: fromName || "אנונימי",
      toUid,
      toName: toName || "",
      text: messageText,
      item,
      read: false,
      createdAt: new Date(),
    });

    const updatedSender = await db.collection("users").findOne({ uid: fromUid });
    return NextResponse.json({ inventory: updatedSender.inventory });
  } catch (error) {
    console.error("Error in POST /api/items/send", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
