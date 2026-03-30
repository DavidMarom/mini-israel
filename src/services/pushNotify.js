import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:davidmarom.dev@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to a specific user (by uid).
 * Looks up all their push subscriptions and sends to each.
 * Cleans up stale (410/404) subscriptions automatically.
 *
 * @param {import('mongodb').Db} db  – MongoDB "main" database
 * @param {string} uid               – target user Firebase UID
 * @param {{ title: string, body: string, url?: string }} payload
 */
export async function sendPushToUser(db, uid, { title, body, url }) {
  if (!uid) return { sent: 0, failed: 0 };

  const docs = await db
    .collection("push_subscriptions")
    .find({ uid })
    .toArray();

  if (docs.length === 0) return { sent: 0, failed: 0 };

  const payloadStr = JSON.stringify({
    title: title || "מיני ישראל 🏠",
    body,
    url: url || "/",
  });

  let sent = 0;
  let failed = 0;
  const stale = [];

  await Promise.allSettled(
    docs.map(async (doc) => {
      try {
        await webpush.sendNotification(doc.subscription, payloadStr);
        sent++;
      } catch (e) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          stale.push(doc.endpoint);
        }
        failed++;
      }
    })
  );

  if (stale.length > 0) {
    await db
      .collection("push_subscriptions")
      .deleteMany({ endpoint: { $in: stale } });
  }

  return { sent, failed };
}
