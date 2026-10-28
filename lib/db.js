import pg from "pg";

let pool;
export function getDb() {
  if (!process.env.DALAN_DATABASE_URL) throw new Error("DALAN database is not configured");
  if (!pool) {
    const url = new URL(process.env.DALAN_DATABASE_URL);
    // Neon integration uses sslmode=require; pg 8 warns this may weaken when pg 9
    // adopts libpq semantics. Explicitly require CA and hostname verification.
    if (["require","prefer","verify-ca"].includes(url.searchParams.get("sslmode"))) url.searchParams.set("sslmode", "verify-full");
    pool = new pg.Pool({ connectionString: url.toString(), max: 3, idleTimeoutMillis: 15000, connectionTimeoutMillis: 8000 });
  }
  return pool;
}

export async function getReportSummary() {
  const db = getDb();
  const [stats, list] = await Promise.all([
    db.query("SELECT status, count(*)::int AS count FROM public.dalan_reports GROUP BY status"),
    db.query("SELECT id, category, area, details, approx_lat, approx_lng, status, created_at, reviewed_at FROM public.dalan_reports ORDER BY created_at DESC LIMIT 75")
  ]);
  return { counts: Object.fromEntries(stats.rows.map(r => [r.status, r.count])), reports: list.rows };
}
