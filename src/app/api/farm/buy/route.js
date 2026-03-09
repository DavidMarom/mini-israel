import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 230;
const COLS = 15;
const FARM_PRICE = 500;

export async function POST(request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    // Get board
    const boardCol = db.collection("board");
    const board = await boardCol.findOne({ _id: BOARD_ID });
    let cells = board?.cells || [];

    // Check if user already has a farm
    if (cells.some((c) => c.building === "farm" && c.ownerUid === uid)) {
      return NextResponse.json({ error: "Already has farm" }, { status: 400 });
    }

    // Find user's house
    const houseCell = cells.find((c) => c.building === "main-house" && c.ownerUid === uid);
    if (!houseCell) {
      return NextResponse.json({ error: "No house found" }, { status: 400 });
    }

    // Try to place farm to the right of the house
    const occupiedKeys = new Set(cells.map((c) => `${c.row}-${c.col}`));
    let houseRow = houseCell.row;
    let houseCol = houseCell.col;
    let farmRow = houseRow;
    let farmCol = houseCol + 1;
    let houseMoved = false;

    const rightTileFree = farmCol < COLS && !occupiedKeys.has(`${farmRow}-${farmCol}`);

    if (!rightTileFree) {
      // Remove current house from occupied set so we can find a new spot
      occupiedKeys.delete(`${houseCell.row}-${houseCell.col}`);

      let newHouseRow = -1, newHouseCol = -1;

      outer:
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          if (!occupiedKeys.has(`${r}-${c}`) && !occupiedKeys.has(`${r}-${c + 1}`)) {
            newHouseRow = r;
            newHouseCol = c;
            break outer;
          }
        }
      }

      if (newHouseRow === -1) {
        return NextResponse.json({ error: "No space available" }, { status: 400 });
      }

      // Move house to new position
      cells = cells.map((c) => {
        if (c.row === houseCell.row && c.col === houseCell.col && c.building === "main-house" && c.ownerUid === uid) {
          return { ...c, row: newHouseRow, col: newHouseCol };
        }
        return c;
      });

      houseRow = newHouseRow;
      houseCol = newHouseCol;
      farmRow = newHouseRow;
      farmCol = newHouseCol + 1;
      houseMoved = true;
    }

    // Place farm
    cells.push({ row: farmRow, col: farmCol, building: "farm", ownerUid: uid, ownerName: houseCell.ownerName });

    // Save board
    await boardCol.updateOne(
      { _id: BOARD_ID },
      { $set: { cells, updatedAt: new Date() } },
      { upsert: true }
    );

    // Deduct coins
    const result = await db.collection("users").findOneAndUpdate(
      { uid, money: { $gte: FARM_PRICE } },
      { $inc: { money: -FARM_PRICE }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      money: result.money,
      farmRow,
      farmCol,
      ...(houseMoved ? { newHouseRow: houseRow, newHouseCol: houseCol } : {}),
    });
  } catch (error) {
    console.error("Error in POST /api/farm/buy", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
