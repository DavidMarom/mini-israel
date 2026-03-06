import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const requests = await db.collection("advertise_requests")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ requests });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, company, phone, email, message } = await req.json();
    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("main");
    const doc = {
      name: name.trim(),
      company: company?.trim() || null,
      phone: phone.trim(),
      email: email?.trim() || null,
      message: message.trim(),
      status: "new",
      createdAt: new Date(),
    };
    const { insertedId } = await db.collection("advertise_requests").insertOne(doc);
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
    await db.collection("advertise_requests").updateOne(
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
    await db.collection("advertise_requests").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
