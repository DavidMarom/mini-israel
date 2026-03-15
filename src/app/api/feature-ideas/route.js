import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const ideas = await db.collection("feature_ideas")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ ideas });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, idea } = await req.json();
    if (!idea?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("main");
    const doc = {
      name: name?.trim() || null,
      idea: idea.trim(),
      status: "new",
      createdAt: new Date(),
    };
    const { insertedId } = await db.collection("feature_ideas").insertOne(doc);
    return NextResponse.json({ ok: true, id: insertedId }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const { ObjectId } = await import("mongodb");
    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("feature_ideas").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const { ObjectId } = await import("mongodb");
    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("feature_ideas").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
