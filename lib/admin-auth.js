import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "dalan_admin_session";
const MAX_AGE = 8 * 60 * 60;

export function checkPassword(password) {
  const stored = process.env.DALAN_ADMIN_PASSWORD_HASH || "";
  if (typeof password !== "string" || password.length > 200 || !stored.includes(":")) return false;
  const [salt, hex] = stored.split(":");
  if (!/^[0-9a-f]{32}$/.test(salt) || !/^[0-9a-f]{128}$/.test(hex)) return false;
  const expected = Buffer.from(hex, "hex");
  const actual = scryptSync(password, Buffer.from(salt, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

export function makeAdminSession() {
  const key = process.env.DALAN_ADMIN_SESSION_SECRET;
  if (!key || key.length < 48) throw new Error("Admin session secret missing");
  const payload = Buffer.from(String(Date.now() + MAX_AGE * 1000)).toString("base64url");
  const signature = createHmac("sha256", key).update(payload).digest("base64url");
  return payload + "." + signature;
}

export async function hasAdminSession() {
  const key = process.env.DALAN_ADMIN_SESSION_SECRET;
  if (!key || key.length < 48) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || raw.length > 250) return false;
  const [payload, signature, extra] = raw.split(".");
  if (!payload || !signature || extra) return false;
  const expected = createHmac("sha256", key).update(payload).digest();
  let supplied;
  try { supplied = Buffer.from(signature, "base64url"); } catch { return false; }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;
  const expiry = Number(Buffer.from(payload, "base64url").toString("utf8"));
  return Number.isFinite(expiry) && expiry > Date.now() && expiry <= Date.now() + MAX_AGE * 1000;
}

export const adminCookie = { name: COOKIE, options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: MAX_AGE } };

export function checkSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const host = request.headers.get("host");
    return originUrl.host === host && (originUrl.protocol === "https:" || (originUrl.protocol === "http:" && /^(localhost|127\\.0\\.0\\.1)(:\\d+)?$/.test(host||"")));
  } catch { return false; }
}
