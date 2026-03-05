import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const ads = await db.collection("ads")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ ads }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/ads", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
