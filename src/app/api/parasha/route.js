import { NextResponse } from "next/server";

function flattenText(he) {
  if (!Array.isArray(he)) return [];
  if (typeof he[0] === "string") return he;
  return he.flat();
}

export async function GET() {
  try {
    const hebcalRes = await fetch(
      "https://www.hebcal.com/shabbat?cfg=json&geo=geoname&geonameid=281184&M=on",
      { next: { revalidate: 3600 } }
    );
    const hebcalData = await hebcalRes.json();
    const parashaItem = hebcalData.items?.find((item) => item.category === "parashat");

    if (!parashaItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const sefariaRef = parashaItem.title.replace(/ /g, "_");
    const textRes = await fetch(
      `https://www.sefaria.org/api/texts/${sefariaRef}?lang=he&commentary=0&context=0`,
      { next: { revalidate: 3600 } }
    );
    const textData = await textRes.json();
    const verses = flattenText(textData.he);

    return NextResponse.json({
      name: parashaItem.hebrew,
      nameEn: parashaItem.title,
      date: parashaItem.date,
      verses,
    });
  } catch (error) {
    console.error("Error fetching parasha", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
