import { NextResponse } from "next/server";

/**
 * Wraps a Next.js Route Handler to provide centralized error handling.
 *
 * Before:
 *   export async function POST(req) {
 *     try { ... } catch (e) { console.error(e); return NextResponse.json(...) }
 *   }
 *
 * After:
 *   export const POST = withHandler(async (req) => { ... });
 *
 * Any unhandled throw inside the handler is caught here, logged with the
 * request method and path for easier debugging, and returned as a consistent
 * 500 response. Business-logic errors should still return early with explicit
 * NextResponse.json calls — this only catches the unexpected ones.
 */
export function withHandler(handler) {
  return async function (req, ctx) {
    try {
      return await handler(req, ctx);
    } catch (e) {
      const path = req.nextUrl?.pathname ?? "unknown";
      console.error(`[API Error] ${req.method} ${path}`, e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
