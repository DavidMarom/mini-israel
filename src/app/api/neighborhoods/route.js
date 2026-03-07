import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

const BOARD_ID = "main-board";
const MAX_DIST = 5;   // Chebyshev distance to be "neighbors"
const MIN_SIZE = 10;  // minimum houses to form a neighborhood
const DAILY_BONUS = 50;

const NAMES = [
  "שכונת הזיתים", "שכונת הדקלים", "שכונת הורדים", "שכונת האלונים",
  "שכונת הברושים", "שכונת התמרים", "שכונת הגפנים", "שכונת הרימונים",
  "שכונת האגסים", "שכונת השקדים", "שכונת התאנים", "שכונת הסנהדרין",
  "שכונת המלכים", "שכונת הנביאים", "שכונת החשמונאים", "שכונת הכרמל",
  "שכונת הגליל", "שכונת הנגב", "שכונת הירדן", "שכונת השרון",
];

function chebyshev(a, b) {
  return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
}

function clusterHouses(houses) {
  const visited = new Set();
  const clusters = [];

  for (let i = 0; i < houses.length; i++) {
    if (visited.has(i)) continue;
    const cluster = [];
    const queue = [i];
    visited.add(i);
    while (queue.length > 0) {
      const cur = queue.shift();
      cluster.push(cur);
      for (let j = 0; j < houses.length; j++) {
        if (!visited.has(j) && chebyshev(houses[cur], houses[j]) <= MAX_DIST) {
          visited.add(j);
          queue.push(j);
        }
      }
    }
    if (cluster.length >= MIN_SIZE) {
      clusters.push(cluster.map((i) => houses[i]));
    }
  }
  return clusters;
}

function makeId(centerRow, centerCol) {
  return `nbhd-${Math.round(centerRow)}-${Math.round(centerCol)}`;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    const client = await clientPromise;
    const db = client.db("main");

    const [boardDoc, namesDoc] = await Promise.all([
      db.collection("board").findOne({ _id: BOARD_ID }),
      db.collection("neighborhood_names").find({}).toArray(),
    ]);

    const nameMap = {};
    namesDoc.forEach((n) => { nameMap[n._id] = n.name; });

    const cells = boardDoc?.cells || [];
    const houses = cells.filter((c) => c.building === "main-house" && c.ownerUid);

    const clusters = clusterHouses(houses);

    // For each cluster, compute centroid and assign stable name
    const neighborhoods = await Promise.all(clusters.map(async (cluster) => {
      const centerRow = cluster.reduce((s, h) => s + h.row, 0) / cluster.length;
      const centerCol = cluster.reduce((s, h) => s + h.col, 0) / cluster.length;
      const id = makeId(centerRow, centerCol);

      // Assign name if not yet stored
      if (!nameMap[id]) {
        const idx = ((Math.round(centerRow) * 37 + Math.round(centerCol) * 13) % NAMES.length + NAMES.length) % NAMES.length;
        nameMap[id] = NAMES[idx];
        await db.collection("neighborhood_names").updateOne(
          { _id: id },
          { $set: { name: NAMES[idx] } },
          { upsert: true }
        );
      }

      return {
        id,
        name: nameMap[id],
        centerRow: Math.round(centerRow),
        centerCol: Math.round(centerCol),
        memberCount: cluster.length,
        members: cluster.map((h) => h.ownerUid),
      };
    }));

    // Check if user claimed today
    let claimedTodayId = null;
    if (uid) {
      const today = new Date().toISOString().slice(0, 10);
      const claim = await db.collection("neighborhood_claims").findOne({ uid, date: today });
      if (claim) claimedTodayId = claim.neighborhoodId;
    }

    return NextResponse.json({ neighborhoods, claimedTodayId, dailyBonus: DAILY_BONUS });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
