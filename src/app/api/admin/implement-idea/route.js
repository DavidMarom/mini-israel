import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Dynamic import prevents Turbopack from statically analyzing child_process usage.
    // Relative script path (no process.cwd() prefix) avoids Turbopack's
    // "server relative imports" error, which fires on process.cwd() + path patterns.
    const { spawn } = await import("child_process");

    const child = spawn(process.execPath, ["scripts/implement-idea.mjs", id], {
      cwd: process.cwd(),
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    child.stdout?.on("data", (d) => process.stdout.write(`[idea:${id}] ${d}`));
    child.stderr?.on("data", (d) => process.stderr.write(`[idea:${id}] ${d}`));
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
