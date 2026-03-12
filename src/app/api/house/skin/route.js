import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";

const HOUSE_IMAGES = [
  "/assets/house/house_1.png",
  "/assets/house/house_2.png",
  "/assets/house/house_3.png",
  "/assets/house/house_4.png",
];

export async function POST(request) {
  try {
    const { uid, houseImg } = await request.json();
    if (!uid || !HOUSE_IMAGES.includes(houseImg))
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");
    const boardCol = db.collection("board");
    const board = await boardCol.findOne({ _id: BOARD_ID });
    let cells = board?.cells || [];

    const houseIndex = cells.findIndex((c) => c.building === "main-house" && c.ownerUid === uid);
    if (houseIndex === -1)
      return NextResponse.json({ error: "No house found" }, { status: 400 });

    cells = cells.map((c, i) => (i === houseIndex ? { ...c, houseImg } : c));
    await boardCol.updateOne({ _id: BOARD_ID }, { $set: { cells, updatedAt: new Date() } });

    return NextResponse.json({ ok: true, houseImg });
  } catch (error) {
    console.error("Error in POST /api/house/skin", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
