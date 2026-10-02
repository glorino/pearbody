import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkCredentials,
  createSessionToken,
} from "@/lib/auth";

const WINDOW_MS = 10 * 60 * 1000; // count failures within 10 minutes
const MAX_FAILURES = 5;
const LOCK_MS = 5 * 60 * 1000; // lock for 5 minutes after MAX_FAILURES

type Attempt = { count: number; windowStart: number; lockedUntil: number };
const attempts = new Map<string, Attempt>();

function clientKey(request: Request): string {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function registerFailure(key: string, now: number): void {
  const prev = attempts.get(key);
  const fresh = !prev || now - prev.windowStart > WINDOW_MS;
  const count = fresh ? 1 : prev!.count + 1;
  attempts.set(key, {
    count,
    windowStart: fresh ? now : prev!.windowStart,
    lockedUntil: count >= MAX_FAILURES ? now + LOCK_MS : prev?.lockedUntil ?? 0,
  });
}

export async function POST(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const current = attempts.get(key);

  if (current && current.lockedUntil > now) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let payload: { username?: unknown; password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const username = String(payload.username ?? "");
  const password = String(payload.password ?? "");

  const valid =
    username.length > 0 &&
    password.length > 0 &&
    username.length <= 128 &&
    password.length <= 256 &&
    checkCredentials(username, password);

  if (!valid) {
    registerFailure(key, now);
    // Keep response time roughly constant for bad credentials.
    await new Promise((resolve) => setTimeout(resolve, 300));
    return NextResponse.json(
      { ok: false, error: "Invalid username or password." },
      { status: 401 },
    );
  }

  attempts.delete(key);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
