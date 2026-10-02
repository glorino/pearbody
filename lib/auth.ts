import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "pb_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function hmac(payload: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const exp = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  return `${exp}.${hmac(exp)}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token || !process.env.SESSION_SECRET) return false;
  const [expRaw, signature] = token.split(".");
  if (!expRaw || !signature) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = Buffer.from(hmac(expRaw), "utf8");
  const actual = Buffer.from(signature, "utf8");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.DASHBOARD_USER;
  const expectedPass = process.env.DASHBOARD_PASSWORD;
  if (!expectedUser || !expectedPass) return false;
  const userOk = timingSafeEqual(sha256(username), sha256(expectedUser));
  const passOk = timingSafeEqual(sha256(password), sha256(expectedPass));
  return userOk && passOk;
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
