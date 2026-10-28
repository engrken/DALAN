import { createHash, randomBytes } from "node:crypto";
import { getDb } from "./db";

export function newToken() { return randomBytes(32).toString("hex"); }
export function tokenHash(value) { return createHash("sha256").update(value).digest("hex"); }
export const goodToken = value => typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
export const isCoordinate = (lat,lng) => typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat)<=90 && Math.abs(lng)<=180;
export const vehicleTypes = new Set(["unknown","tricycle","jeepney","bus","van","car","motorcycle","walking","other"]);
export const modeHints = new Set(["unknown","walking","motorized"]);
export function noCache(response){response.headers.set("Cache-Control","no-store, max-age=0");response.headers.set("Referrer-Policy","no-referrer");return response;}
export async function purgeExpired(){await getDb().query("DELETE FROM public.dalan_trip_shares WHERE expires_at <= now()");}
