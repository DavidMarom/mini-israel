import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const WEAPONS_ITEMS = {
  rifle:        { id: "rifle",        img: "/assets/weapons/rifle.png",        name: "רובה",     price: 150 },
  grenade:      { id: "grenade",      img: "/assets/weapons/grenade.png",      name: "רימון",    price: 80  },
  flamethrower: { id: "flamethrower", img: "/assets/weapons/flamethrower.png", name: "להביור",  price: 200 },
  tank:         { id: "tank",         img: "/assets/weapons/tank.png",         name: "טנק",      price: 300 },
};

export async function POST(request) {
  try {
    const { uid, itemId } = await request.json();
    const item = WEAPONS_ITEMS[itemId];

    if (!uid || !item) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const result = await db.collection("users").findOneAndUpdate(
      { uid, money: { $gte: item.price } },
      {
        $inc: { money: -item.price },
        $push: { inventory: { id: item.id, img: item.img, name: item.name } },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    return NextResponse.json({ money: result.money, inventory: result.inventory });
  } catch (error) {
    console.error("Error in POST /api/weapons/buy", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
