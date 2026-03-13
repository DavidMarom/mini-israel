import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const requests = await db.collection("cashout_requests")
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
    const { phone, coins, uid, name } = await req.json();
    if (!phone || !coins || coins < 1000) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const userDoc = await db.collection("users").findOne({ uid });
    if (!userDoc) {
      return NextResponse.json({ error: "אין מספיק מטבעות" }, { status: 400 });
    }
    if (!(userDoc.waClicks > 0)) {
      return NextResponse.json({ error: "not_eligible" }, { status: 403 });
    }
    if ((userDoc.money ?? 0) < coins) {
      return NextResponse.json({ error: "אין מספיק מטבעות" }, { status: 400 });
    }

    const ils = Math.floor(coins / 200);

    await db.collection("users").updateOne({ uid }, { $inc: { money: -coins } });
    await db.collection("cashout_requests").insertOne({
      uid, name, phone, coins, ils, status: "new", createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    const { ObjectId } = await import("mongodb");
    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("cashout_requests").updateOne(
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
    const { ObjectId } = await import("mongodb");
    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("cashout_requests").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
