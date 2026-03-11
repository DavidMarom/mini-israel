import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 230;
const COLS = 15;
const CC_PRICE = 600;

export async function POST(request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    const boardCol = db.collection("board");
    const board = await boardCol.findOne({ _id: BOARD_ID });
    let cells = board?.cells || [];

    // Check if user already has a CC
    if (cells.some((c) => c.building === "community-center" && c.ownerUid === uid)) {
      return NextResponse.json({ error: "Already has community center" }, { status: 400 });
    }

    // Find user's house and check level
    const houseCell = cells.find((c) => c.building === "main-house" && c.ownerUid === uid);
    if (!houseCell) return NextResponse.json({ error: "No house found" }, { status: 400 });

    const houseLevel = houseCell.houseLevel || 1;
    if (houseLevel < 3) return NextResponse.json({ error: "House level 3 required" }, { status: 400 });

    // Validate user inventory
    const user = await db.collection("users").findOne({ uid });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const friendFlags = (user.inventory || []).filter((i) => i.id === "flag" && i.fromFriend);
    if (friendFlags.length < 2) {
      return NextResponse.json({ error: "Need friend flag x2" }, { status: 400 });
    }

    // Atomically deduct cost
    const result = await db.collection("users").findOneAndUpdate(
      { uid, money: { $gte: CC_PRICE } },
      { $inc: { money: -CC_PRICE }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result) return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });

    // Consume 2 friend flags
    let updatedUser = await db.collection("users").findOne({ uid });
    for (let i = 0; i < 2; i++) {
      const idx = (updatedUser.inventory || []).findIndex((item) => item.id === "flag" && item.fromFriend);
      if (idx !== -1) {
        await db.collection("users").updateOne({ uid }, { $unset: { [`inventory.${idx}`]: 1 } });
        await db.collection("users").updateOne({ uid }, { $pull: { inventory: null } });
        updatedUser = await db.collection("users").findOne({ uid });
      }
    }

    // Find placement: try adjacent tiles around house/farm
    const occupiedKeys = new Set(cells.map((c) => `${c.row}-${c.col}`));
    const { row: hr, col: hc } = houseCell;
    const farmCell = cells.find((c) => c.building === "farm" && c.ownerUid === uid);

    // Candidate tiles in priority order
    const candidates = [
      { row: hr, col: hc + 2 },       // right of farm
      { row: hr, col: hc - 1 },       // left of house
      { row: hr + 1, col: hc },       // below house
      { row: hr - 1, col: hc },       // above house
      ...(farmCell ? [
        { row: farmCell.row + 1, col: farmCell.col },
        { row: farmCell.row - 1, col: farmCell.col },
      ] : []),
    ];

    let ccRow = -1, ccCol = -1;
    for (const { row, col } of candidates) {
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS && !occupiedKeys.has(`${row}-${col}`)) {
        ccRow = row;
        ccCol = col;
        break;
      }
    }

    if (ccRow === -1) {
      // Scan for any free tile
      outer:
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!occupiedKeys.has(`${r}-${c}`)) {
            ccRow = r;
            ccCol = c;
            break outer;
          }
        }
      }
    }

    if (ccRow === -1) {
      return NextResponse.json({ error: "No space available" }, { status: 400 });
    }

    cells.push({
      row: ccRow,
      col: ccCol,
      building: "community-center",
      ownerUid: uid,
      ownerName: houseCell.ownerName,
      ccLevel: 1,
    });

    await boardCol.updateOne(
      { _id: BOARD_ID },
      { $set: { cells, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true, money: result.money, ccRow, ccCol, inventory: updatedUser.inventory });
  } catch (error) {
    console.error("Error in POST /api/community-center/buy", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
