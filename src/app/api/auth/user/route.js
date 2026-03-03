import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, email, name, photoURL } = body || {};

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

      if (name && name !== existing.name) {
        update.name = name;
      }

      if (Object.keys(update).length > 0) {
        update.updatedAt = now;
        await users.updateOne({ _id: existing._id }, { $set: update });
        return NextResponse.json(
          { user: { ...existing, ...update }, created: false },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { user: existing, created: false },
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

    return NextResponse.json(
      { user: { ...newUser, _id: insertedId }, created: true },
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

