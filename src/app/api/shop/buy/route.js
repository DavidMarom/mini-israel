import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const SHOP_ITEMS = {
  flower:     { id: "flower",     emoji: "🌸", name: "פרח",         price: 10  },
  falafel:    { id: "falafel",    emoji: "🧆", name: "פלאפל",       price: 25  },
  flag:       { id: "flag",       emoji: "🇮🇱", name: "דגל ישראל",  price: 10  },
  bike:       { id: "bike",       img: "/assets/items/bike.png",        name: "אופניים", price: 80  },
  headphones: { id: "headphones", img: "/assets/items/headphones.png",  name: "אוזניות", price: 50  },
  pc:         { id: "pc",         img: "/assets/items/pc.png",          name: "מחשב",    price: 120 },
  shirt:      { id: "shirt",      img: "/assets/items/shirt.png",       name: "חולצה",   price: 30  },
};

export async function POST(request) {
  try {
    const { uid, itemId } = await request.json();
    const item = SHOP_ITEMS[itemId];

    if (!uid || !item) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const result = await db.collection("users").findOneAndUpdate(
      { uid, money: { $gte: item.price } },
      {
        $inc: { money: -item.price },
        $push: { inventory: { id: item.id, ...(item.emoji ? { emoji: item.emoji } : { img: item.img }), name: item.name } },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    return NextResponse.json({ money: result.money, inventory: result.inventory });
  } catch (error) {
    console.error("Error in POST /api/shop/buy", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
