import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";
import { sendPushToUser } from "../../../../services/pushNotify";
import { sendMail } from "../../../../services/mail";

const BOARD_ID = "main-board";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mini-israel.com";

const WEAPON_META = {
  rifle:        { emoji: "🔫", actionHe: "ירה עליך",           steal: 0.10 },
  grenade:      { emoji: "💣", actionHe: "זרק עליך רימון",     steal: 0.40 },
  flamethrower: { emoji: "🔥", actionHe: "שרף את הבית שלך",   steal: 0.20 },
  tank:         { emoji: "🪖", actionHe: "הפציץ את הבית שלך", steal: 1.00 },
};

export async function POST(req) {
  try {
    const { uid, targetUid, weaponId } = await req.json();

    if (!uid || !targetUid || !weaponId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (uid === targetUid) {
      return NextResponse.json({ error: "Cannot attack yourself" }, { status: 400 });
    }
    if (!WEAPON_META[weaponId]) {
      return NextResponse.json({ error: "Unknown weapon" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const attacker = await db.collection("users").findOne({ uid });
    if (!attacker) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const weaponIndex = (attacker.inventory || []).findIndex((item) => item.id === weaponId);
    if (weaponIndex === -1) {
      return NextResponse.json({ error: "Weapon not in inventory" }, { status: 400 });
    }

    // Remove one weapon from inventory
    const newInventory = [...attacker.inventory];
    newInventory.splice(weaponIndex, 1);
    await db.collection("users").updateOne({ uid }, { $set: { inventory: newInventory } });

    // Transfer money from target to attacker
    const { steal } = WEAPON_META[weaponId];
    const targetUser = await db.collection("users").findOne({ uid: targetUid });
    const targetMoney = targetUser?.money ?? 0;
    const stolen = Math.floor(targetMoney * steal);

    if (stolen > 0) {
      await db.collection("users").updateOne({ uid: targetUid }, { $inc: { money: -stolen } });
      await db.collection("users").updateOne({ uid }, { $inc: { money: stolen } });
    }

    // Mark target house as attacked on the board
    const boardDoc = await db.collection("board").findOne({ _id: BOARD_ID });
    const cells = boardDoc?.cells || [];
    const targetIdx = cells.findIndex((c) => c.building === "main-house" && c.ownerUid === targetUid);
    if (targetIdx !== -1) {
      cells[targetIdx] = { ...cells[targetIdx], attacked: weaponId };
      await db.collection("board").updateOne(
        { _id: BOARD_ID },
        { $set: { cells, updatedAt: new Date() } }
      );
    }

    // Notify target (fire-and-forget)
    const attackerName = attacker.name || "מישהו";
    const { emoji, actionHe } = WEAPON_META[weaponId];
    const revengeUrl = `${SITE_URL}/?goto=${uid}`;
    const stolenText = stolen > 0 ? ` ונגנבו ממך ${stolen} 🪙` : "";

    sendPushToUser(db, targetUid, {
      title: `${emoji} תקיפה על הבית שלך!`,
      body: `${attackerName} ${actionHe}${stolenText}!`,
      url: revengeUrl,
    }).catch((e) => console.error("Push notification failed:", e));

    if (targetUser?.email) {
      sendMail({
        to: targetUser.email,
        subject: `${emoji} ${attackerName} ${actionHe}!`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #1a1a2e; color: #eee; border-radius: 12px;">
            <h2 style="color: #f5c542; margin-top: 0;">${emoji} תקיפה על הבית שלך!</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              <strong>${attackerName}</strong> ${actionHe} במיני ישראל${stolenText}!
            </p>
            <a href="${revengeUrl}" style="display: inline-block; margin-top: 12px; padding: 12px 28px; background: #f5c542; color: #1a1a2e; font-weight: bold; font-size: 16px; border-radius: 8px; text-decoration: none;">
              ⚔️ תקוף בחזרה!
            </a>
            <p style="margin-top: 24px; font-size: 13px; color: #888;">מיני ישראל 🏠</p>
          </div>
        `,
      }).catch((e) => console.error("Email notification failed:", e));
    }

    return NextResponse.json({ ok: true, inventory: newInventory, stolen });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
