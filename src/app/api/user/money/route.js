import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function POST(request) {
  try {
    const { uid, amount } = await request.json();

    if (!uid || typeof amount !== "number") {
      return NextResponse.json({ error: "Missing uid or amount" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const result = await db.collection("users").findOneAndUpdate(
      { uid },
      { $inc: { money: amount }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ money: result.money });
  } catch (error) {
    console.error("Error in POST /api/user/money", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
