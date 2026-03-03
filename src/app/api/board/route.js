import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

const BOARD_ID = "main-board";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const board = db.collection("board");

    const existing = await board.findOne({ _id: BOARD_ID });

    if (!existing) {
      return NextResponse.json(
        {
          _id: BOARD_ID,
          rows: 30,
          cols: 15,
          cells: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(existing, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/board", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { rows, cols, cells } = body || {};

    if (
      typeof rows !== "number" ||
      typeof cols !== "number" ||
      !Array.isArray(cells)
    ) {
      return NextResponse.json(
        { error: "Invalid board payload" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("main");
    const board = db.collection("board");

    await board.updateOne(
      { _id: BOARD_ID },
      {
        $set: {
          rows,
          cols,
          cells,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/board", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

