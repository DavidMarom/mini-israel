import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";
import { withHandler, ApiError } from "../../../services/withHandler";

const DONATION_COINS = 100;
const DONATION_ILS = 1;

export const GET = withHandler(async () => {
  const client = await clientPromise;
  const db = client.db("main");
  const donations = await db.collection("donations")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  const totalCoins = donations.reduce((sum, d) => sum + (d.coins || 0), 0);
  const totalIls = donations.reduce((sum, d) => sum + (d.ils || 0), 0);
  return NextResponse.json({ donations, totalCoins, totalIls });
});

export const POST = withHandler(async (req) => {
  const { uid, name } = await req.json();
  if (!uid) throw new ApiError(400, "Missing uid");

  const client = await clientPromise;
  const db = client.db("main");

  const user = await db.collection("users").findOne({ uid });
  if (!user) throw new ApiError(404, "User not found");
  if ((user.money || 0) < DONATION_COINS) throw new ApiError(400, "Insufficient funds");

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentDonation = await db.collection("donations").findOne({
    uid,
    createdAt: { $gte: oneWeekAgo },
  });
  if (recentDonation) throw new ApiError(429, "Already donated this week");

  const newMoney = user.money - DONATION_COINS;
  await db.collection("users").updateOne(
    { uid },
    { $set: { money: newMoney, updatedAt: new Date() } }
  );

  await db.collection("donations").insertOne({
    uid,
    name: name || uid,
    coins: DONATION_COINS,
    ils: DONATION_ILS,
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true, money: newMoney, coins: DONATION_COINS, ils: DONATION_ILS });
});
