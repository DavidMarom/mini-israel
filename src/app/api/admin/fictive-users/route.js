import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 230;
const COLS = 15;

const HEBREW_NAMES = [
  "אבי כהן", "מירי לוי", "דני פרץ", "רחל גולן", "יוסי שפירא",
  "שירה אמיר", "נועם ברק", "תמר דוד", "עמית ישראלי", "לירון כץ",
  "אורי מזרחי", "מיכל נחום", "רן סגל", "יעל עמר", "גל פינטו",
  "עידן קפלן", "הדר ריבק", "טל שמש", "אלון תמיר", "נויה אדלר",
  "בן גבע", "ליאור חזן", "מיה טל", "שחר ינאי", "אלה כהן",
];

function randomName() {
  return HEBREW_NAMES[Math.floor(Math.random() * HEBREW_NAMES.length)];
}

function findEmptyCell(cells) {
  const occupied = new Set(cells.map((c) => `${c.row}-${c.col}`));
  // Try random spots; avoid row 0-5 (top border area)
  for (let attempt = 0; attempt < 500; attempt++) {
    const row = 5 + Math.floor(Math.random() * (ROWS - 10));
    const col = Math.floor(Math.random() * COLS);
    if (!occupied.has(`${row}-${col}`)) return { row, col };
  }
  return null;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const users = await db.collection("users")
      .find({ fictive: true })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ users });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("main");

    const uid = `fictive_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const name = randomName();
    const money = Math.floor(Math.random() * 4900) + 100;

    // Get current board
    const boardDoc = await db.collection("board").findOne({ _id: BOARD_ID });
    const cells = boardDoc?.cells || [];

    const pos = findEmptyCell(cells);
    if (!pos) return NextResponse.json({ error: "No empty cell found" }, { status: 500 });

    // Place house on board
    const newCell = { row: pos.row, col: pos.col, building: "main-house", ownerUid: uid, ownerName: name };
    const updatedCells = [...cells, newCell];
    await db.collection("board").updateOne(
      { _id: BOARD_ID },
      { $set: { cells: updatedCells, updatedAt: new Date() } },
      { upsert: true }
    );

    // Create user
    const user = {
      uid, name, email: `${uid}@fictive.mini-israel.com`,
      money, fictive: true, suspended: false,
      houseRow: pos.row, houseCol: pos.col,
      createdAt: new Date().toISOString(),
    };
    await db.collection("users").insertOne(user);

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { uid } = await req.json();
    const client = await clientPromise;
    const db = client.db("main");

    // Remove house from board
    const boardDoc = await db.collection("board").findOne({ _id: BOARD_ID });
    if (boardDoc) {
      const updatedCells = (boardDoc.cells || []).filter((c) => c.ownerUid !== uid);
      await db.collection("board").updateOne(
        { _id: BOARD_ID },
        { $set: { cells: updatedCells, updatedAt: new Date() } }
      );
    }

    // Remove user
    await db.collection("users").deleteOne({ uid, fictive: true });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
