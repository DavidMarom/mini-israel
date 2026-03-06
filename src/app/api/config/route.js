import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const [starHouseDoc, treasureWinnerDoc, yadSaraDoc] = await Promise.all([
      db.collection("config").findOne({ _id: "star_house" }),
      db.collection("config").findOne({ _id: "treasure_winner" }),
      db.collection("config").findOne({ _id: "yad_sara_visible" }),
    ]);

    const treasureWinner = treasureWinnerDoc
      ? { name: treasureWinnerDoc.name, claimedAt: treasureWinnerDoc.claimedAt, sponsor: treasureWinnerDoc.sponsor || null }
      : null;

    const starHouse = starHouseDoc
      ? { uid: starHouseDoc.uid, name: starHouseDoc.name, sponsor: starHouseDoc.sponsor || null }
      : null;

    const yadSaraVisible = yadSaraDoc ? yadSaraDoc.visible !== false : true;

    return NextResponse.json({ starHouse, treasureWinner, yadSaraVisible });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
