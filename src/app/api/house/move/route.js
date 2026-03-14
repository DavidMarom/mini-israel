import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const BOARD_ID = "main-board";
const ROWS = 230;
const COLS = 15;

function isOccupied(occupiedSet, row, col) {
  return occupiedSet.has(`${row},${col}`);
}

function findRandomSpot(cells, excludeIdxs) {
  const occupied = new Set(
    cells
      .filter((_, i) => !excludeIdxs.has(i))
      .flatMap((c) => [`${c.row},${c.col}`])
  );
  for (let attempt = 0; attempt < 3000; attempt++) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * (COLS - 1)); // leave room for farm at col+1
    if (!isOccupied(occupied, row, col) && !isOccupied(occupied, row, col + 1)) {
      return { row, col };
    }
  }
  return null;
}

function findSpotNearCenter(cells, excludeIdxs, centerRow, centerCol) {
  const occupied = new Set(
    cells
      .filter((_, i) => !excludeIdxs.has(i))
      .flatMap((c) => [`${c.row},${c.col}`])
  );
  for (let radius = 0; radius <= 30; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== radius) continue;
        const row = centerRow + dr;
        const col = centerCol + dc;
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS - 1) continue;
        if (!isOccupied(occupied, row, col) && !isOccupied(occupied, row, col + 1)) {
          return { row, col };
        }
      }
    }
  }
  return null;
}

export async function POST(req) {
  try {
    const { uid, destination, centerRow, centerCol } = await req.json();
    if (!uid || !destination) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");
    const boardDoc = await db.collection("board").findOne({ _id: BOARD_ID });
    const cells = boardDoc?.cells || [];

    const houseIdx = cells.findIndex(
      (c) => c.building === "main-house" && c.ownerUid === uid
    );
    if (houseIdx === -1) {
      return NextResponse.json({ error: "House not found" }, { status: 404 });
    }

    const house = cells[houseIdx];
    const oldRow = house.row;
    const oldCol = house.col;

    // Check for adjacent farm (col + 1)
    const farmIdx = cells.findIndex(
      (c) =>
        c.building === "farm" &&
        c.ownerUid === uid &&
        c.row === oldRow &&
        c.col === oldCol + 1
    );

    const excludeIdxs = new Set([houseIdx]);
    if (farmIdx !== -1) excludeIdxs.add(farmIdx);

    let newPos;
    if (destination === "random") {
      newPos = findRandomSpot(cells, excludeIdxs);
    } else if (destination === "neighborhood") {
      if (centerRow == null || centerCol == null) {
        return NextResponse.json({ error: "Missing neighborhood center" }, { status: 400 });
      }
      newPos = findSpotNearCenter(cells, excludeIdxs, centerRow, centerCol);
    } else {
      return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
    }

    if (!newPos) {
      return NextResponse.json({ error: "No empty space found" }, { status: 500 });
    }

    const newCells = cells.filter((_, i) => !excludeIdxs.has(i));
    newCells.push({ ...house, row: newPos.row, col: newPos.col });
    if (farmIdx !== -1) {
      newCells.push({ ...cells[farmIdx], row: newPos.row, col: newPos.col + 1 });
    }

    await db.collection("board").updateOne(
      { _id: BOARD_ID },
      { $set: { cells: newCells } }
    );

    return NextResponse.json({ row: newPos.row, col: newPos.col });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
