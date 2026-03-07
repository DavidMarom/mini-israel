import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

const POLL_ID = "messi_vs_ronaldo";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    const client = await clientPromise;
    const db = client.db("main");

    const [poll, userVoteDoc] = await Promise.all([
      db.collection("polls").findOne({ _id: POLL_ID }),
      uid ? db.collection("poll_votes").findOne({ uid, pollId: POLL_ID }) : null,
    ]);

    return NextResponse.json({
      messi: poll?.messi ?? 0,
      ronaldo: poll?.ronaldo ?? 0,
      userVote: userVoteDoc?.vote ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { uid, vote } = await req.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    if (vote !== "messi" && vote !== "ronaldo") {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const existing = await db.collection("poll_votes").findOne({ uid, pollId: POLL_ID });
    const prevVote = existing?.vote ?? null;

    await db.collection("poll_votes").updateOne(
      { uid, pollId: POLL_ID },
      { $set: { vote, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    const inc = {};
    if (prevVote && prevVote !== vote) inc[prevVote] = -1;
    if (!prevVote || prevVote !== vote) inc[vote] = 1;

    if (Object.keys(inc).length > 0) {
      await db.collection("polls").updateOne(
        { _id: POLL_ID },
        { $inc: inc },
        { upsert: true }
      );
    }

    const poll = await db.collection("polls").findOne({ _id: POLL_ID });
    return NextResponse.json({
      messi: poll?.messi ?? 0,
      ronaldo: poll?.ronaldo ?? 0,
      userVote: vote,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
