import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const users = await db.collection("users")
      .find({}, { projection: { name: 1, money: 1, uid: 1 } })
      .sort({ money: -1 })
      .limit(10)
      .toArray();
    return NextResponse.json({ users });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
