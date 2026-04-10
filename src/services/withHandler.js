import { NextResponse } from "next/server";

/**
 * Throw this inside any withHandler route to return a specific HTTP error.
 *
 *   throw new ApiError(400, "Missing uid");
 *   throw new ApiError(404, "User not found");
 *   throw new ApiError(429, "Already donated this week");
 *
 * withHandler catches it and converts it to NextResponse.json({ error }, { status }).
 * Anything else thrown is treated as an unexpected 500.
 */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

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
 * Business-logic errors: throw new ApiError(status, message)
 * Unexpected errors: caught automatically, logged with method + path, returned as 500.
 */
export function withHandler(handler) {
  return async function (req, ctx) {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      const path = req.nextUrl?.pathname ?? "unknown";
      console.error(`[API Error] ${req.method} ${path}`, e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
