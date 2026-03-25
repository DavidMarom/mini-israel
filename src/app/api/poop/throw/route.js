import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";
import { sendPushToUser } from "../../../../services/pushNotify";
import { sendMail } from "../../../../services/mail";

const BOARD_ID = "main-board";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mini-israel.com";

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

    // --- Notify the target user (fire-and-forget) ---
    const throwerName = thrower.name || "מישהו";
    const revengeUrl = `${SITE_URL}/?goto=${uid}`;

    // Look up the target user for their email
    const targetUser = await db.collection("users").findOne({ uid: targetUid });

    // Push notification
    sendPushToUser(db, targetUid, {
      title: "💩 זרקו לך קקי על הבית!",
      body: `${throwerName} זרק לך קקי על הבית! לחץ כדי לזרוק בחזרה`,
      url: revengeUrl,
    }).catch((e) => console.error("Push notification failed:", e));

    // Email notification
    if (targetUser?.email) {
      sendMail({
        to: targetUser.email,
        subject: `💩 ${throwerName} זרק לך קקי על הבית!`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #1a1a2e; color: #eee; border-radius: 12px;">
            <h2 style="color: #f5c542; margin-top: 0;">💩 זרקו לך קקי על הבית!</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              <strong>${throwerName}</strong> זרק קקי על הבית שלך במיני ישראל!
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              רוצה לזרוק בחזרה? 😈
            </p>
            <a href="${revengeUrl}" style="display: inline-block; margin-top: 12px; padding: 12px 28px; background: #f5c542; color: #1a1a2e; font-weight: bold; font-size: 16px; border-radius: 8px; text-decoration: none;">
              💩 זרוק קקי בחזרה!
            </a>
            <p style="margin-top: 24px; font-size: 13px; color: #888;">
              מיני ישראל 🏠
            </p>
          </div>
        `,
      }).catch((e) => console.error("Email notification failed:", e));
    }

    return NextResponse.json({ ok: true, inventory: newInventory });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
