import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const users = await db.collection("users")
      .find({}, { projection: { uid: 1, email: 1, name: 1, money: 1, suspended: 1, createdAt: 1, waClicks: 1 } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/users", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { uid, action } = await request.json();
    if (!uid || !action) {
      return NextResponse.json({ error: "Missing uid or action" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    if (action === "suspend") {
      await db.collection("users").updateOne({ uid }, { $set: { suspended: true, updatedAt: new Date() } });
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (action === "unsuspend") {
      await db.collection("users").updateOne({ uid }, { $set: { suspended: false, updatedAt: new Date() } });
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error in POST /api/admin/users", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("users").deleteOne({ uid });

    // Remove the user's house from the board
    const board = db.collection("board");
    const boardDoc = await board.findOne({ _id: "main-board" });
    if (boardDoc?.cells) {
      const newCells = boardDoc.cells.filter((c) => c.ownerUid !== uid);
      await board.updateOne({ _id: "main-board" }, { $set: { cells: newCells, updatedAt: new Date() } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/users", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { uid, name, email, money, bio } = await request.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const update = { updatedAt: new Date() };
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (money !== undefined) update.money = Number(money);
    if (bio !== undefined) update.bio = bio;

    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("users").updateOne({ uid }, { $set: update });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in PATCH /api/admin/users", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
