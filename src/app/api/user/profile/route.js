import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("main");
    const user = await db.collection("users").findOne({ uid }, { projection: { name: 1, bio: 1, money: 1 } });

    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ name: user.name || null, bio: user.bio || null, money: user.money ?? 0 });
  } catch (error) {
    console.error("Error in GET /api/user/profile", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
