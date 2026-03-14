import { NextResponse } from "next/server";
import webpush from "web-push";
import clientPromise from "../../../../services/mongo";

webpush.setVapidDetails(
  "mailto:admin@mini-israel.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(req) {
  try {
    const { title, body } = await req.json();
    if (!body?.trim()) {
      return NextResponse.json({ error: "Missing message body" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");
    const docs = await db.collection("push_subscriptions").find({}).toArray();

    const payload = JSON.stringify({ title: title || "מיני ישראל 🏠", body, url: "/" });

    let sent = 0;
    let failed = 0;
    const stale = [];

    await Promise.allSettled(
      docs.map(async (doc) => {
        try {
          await webpush.sendNotification(doc.subscription, payload);
          sent++;
        } catch (e) {
          // 410 Gone = subscription expired, remove it
          if (e.statusCode === 410 || e.statusCode === 404) {
            stale.push(doc.endpoint);
          }
          failed++;
        }
      })
    );

    // Clean up stale subscriptions
    if (stale.length > 0) {
      await db.collection("push_subscriptions").deleteMany({ endpoint: { $in: stale } });
    }

    return NextResponse.json({ ok: true, sent, failed, total: docs.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
