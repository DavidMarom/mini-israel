import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Split filename to prevent Next.js output file tracer from bundling the script
    const scriptFile = ["implement", "idea"].join("-") + ".mjs";
    const scriptPath = path.join(process.cwd(), "scripts", scriptFile);

    const child = spawn("node", [scriptPath, id], {
      cwd: process.cwd(),
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    // Log output to server console so the dev can see progress
    child.stdout.on("data", (d) => process.stdout.write(`[idea:${id}] ${d}`));
    child.stderr.on("data", (d) => process.stderr.write(`[idea:${id}] ${d}`));
    child.on("exit", (code) =>
      console.log(`[idea:${id}] process exited with code ${code}`)
    );

    child.unref();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
