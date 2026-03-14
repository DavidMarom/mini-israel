import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function POST(req) {
  try {
    const { subscription, uid } = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    // Upsert by endpoint so re-subscriptions don't create duplicates
    await db.collection("push_subscriptions").updateOne(
      { endpoint: subscription.endpoint },
      { $set: { subscription, uid: uid || null, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
