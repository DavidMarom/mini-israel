import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../../services/mongo";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const client = await clientPromise;
    const db = client.db("main");
    const messages = await db
      .collection("messages")
      .find({ toUid: uid })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error in GET /api/messages", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { fromUid, fromName, toUid, toName, text } = body;

    if (!fromUid || !toUid || !text?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const doc = {
      fromUid,
      fromName: fromName || "אנונימי",
      toUid,
      toName: toName || "",
      text: text.trim(),
      read: false,
      createdAt: new Date(),
    };

    const result = await db.collection("messages").insertOne(doc);
    return NextResponse.json({ message: { ...doc, _id: result.insertedId } });
  } catch (error) {
    console.error("Error in POST /api/messages", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const uid = searchParams.get("uid");

  if (!id || !uid) {
    return NextResponse.json({ error: "Missing id or uid" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("main");
    // Only allow deleting messages the user received
    await db.collection("messages").deleteOne({ _id: new ObjectId(id), toUid: uid });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in DELETE /api/messages", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
