import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { checkSameOrigin } from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categories = new Set(["road","fare","transport","accessibility","other"]);

export async function GET() {
  try {
    const result = await getDb().query("SELECT count(*)::int AS total FROM public.dalan_reports WHERE status = 'reviewed'");
    return NextResponse.json({ reviewedReports: result.rows[0].total, dataStatus: "pilot-unverified", routes: [], fares: [] }, { headers: { "Cache-Control":"no-store" } });
  } catch {
    return NextResponse.json({ reviewedReports: 0, dataStatus: "unavailable", routes: [], fares: [] }, {status:503});
  }
}

export async function POST(request) {
  try {
    if (!checkSameOrigin(request) || !(request.headers.get("content-type")||"").includes("application/json")) return NextResponse.json({error:"Unsupported request origin or type"},{status:403});
    const raw = await request.text();
    if (raw.length > 2500) return NextResponse.json({error:"Submission too large"},{status:413});
    const body = JSON.parse(raw);
    if (body.website) return NextResponse.json({ok:true});
    const category = String(body.category||"");
    const area = String(body.area||"").trim();
    const details = String(body.details||"").trim();
    if (!categories.has(category) || area.length < 2 || area.length > 100 || details.length < 10 || details.length > 500) return NextResponse.json({error:"Please provide a valid category, area and description (10-500 characters)"},{status:400});
    let lat=null, lng=null;
    if (body.shareApproximateLocation === true) {
      if (typeof body.lat !== "number" || typeof body.lng !== "number" || !Number.isFinite(body.lat) || !Number.isFinite(body.lng) || Math.abs(body.lat)>90 || Math.abs(body.lng)>180) return NextResponse.json({error:"Invalid approximate location"},{status:400});
      lat = Math.round(body.lat * 100)/100;
      lng = Math.round(body.lng * 100)/100;
    }
    const result = await getDb().query("INSERT INTO public.dalan_reports (category,area,details,approx_lat,approx_lng) VALUES ($1,$2,$3,$4,$5) RETURNING id", [category,area,details,lat,lng]);
    return NextResponse.json({ok:true,reference:result.rows[0].id,status:"pending",notice:"Your report is awaiting review, not a verified public advisory."},{status:201,headers:{"Cache-Control":"no-store"}});
  } catch {
    return NextResponse.json({error:"Unable to save your report. Please retry."},{status:503});
  }
}
