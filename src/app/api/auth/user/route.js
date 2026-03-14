import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 230;
const COLS = 15;
const HOUSE_IMAGES = [
  "/assets/house/house_1.png",
  "/assets/house/house_2.png",
  "/assets/house/house_3.png",
  "/assets/house/house_4.png",
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, email, name, bio, photoURL, forceUpdate } = body || {};

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing required user fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("main");
    const users = db.collection("users");

    const existing = await users.findOne({ uid });
    const now = new Date();

    if (existing) {
      let update = {};

      if (name && (forceUpdate || !existing.name)) {
        update.name = name;
      }

      if (typeof bio === "string" && forceUpdate) {
        update.bio = bio;
      }

      if (Object.keys(update).length > 0) {
        update.updatedAt = now;
        await users.updateOne({ _id: existing._id }, { $set: update });
      }

      // Always return house position so the client can scroll to it
      const boardCollection = db.collection("board");
      const boardDoc = await boardCollection.findOne({ _id: BOARD_ID });
      const cells = boardDoc?.cells || [];
      const houseCell = cells.find((c) => c.building === "main-house" && c.ownerUid === uid);

      return NextResponse.json(
        {
          user: { ...existing, ...update },
          created: false,
          houseRow: houseCell?.row ?? null,
          houseCol: houseCell?.col ?? null,
        },
        { status: 200 }
      );
    }

    const newUser = {
      uid,
      email,
      name: name || null,
      photoURL: photoURL || null,
      money: 180,
      createdAt: now,
      updatedAt: now,
    };

    const { insertedId } = await users.insertOne(newUser);

    // Place the new user's house on the board at a random empty cell
    const boardCollection = db.collection("board");
    const boardDoc = await boardCollection.findOne({ _id: BOARD_ID });
    const cells = boardDoc?.cells || [];
    const occupied = new Set(cells.map((c) => `${c.row}-${c.col}`));

    let houseRow, houseCol;
    let attempts = 0;
    do {
      houseRow = Math.floor(Math.random() * ROWS);
      houseCol = Math.floor(Math.random() * COLS);
      attempts++;
    } while (occupied.has(`${houseRow}-${houseCol}`) && attempts < 1000);

    const houseImg = HOUSE_IMAGES[Math.floor(Math.random() * HOUSE_IMAGES.length)];
    const newCells = [
      ...cells,
      { row: houseRow, col: houseCol, building: "main-house", ownerUid: uid, ownerName: name || null, houseImg },
    ];
    await boardCollection.updateOne(
      { _id: BOARD_ID },
      { $set: { cells: newCells, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json(
      { user: { ...newUser, _id: insertedId }, created: true, houseRow, houseCol },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/auth/user POST", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

