import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { hasAdminSession, checkSameOrigin } from "../../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function PATCH(request) {
  if (!(await hasAdminSession())) return NextResponse.json({error:"Unauthorized"},{status:401});
  if (!checkSameOrigin(request) || !(request.headers.get("content-type")||"").includes("application/json")) return NextResponse.json({error:"Invalid origin"},{status:403});
  try {
    const body=await request.json();
    if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id) || !["reviewed","dismissed","pending"].includes(body.status)) return NextResponse.json({error:"Invalid input"},{status:400});
    const result=await getDb().query("UPDATE public.dalan_reports SET status=$1,reviewed_at=CASE WHEN $1='pending' THEN NULL ELSE now() END WHERE id=$2 RETURNING id,status", [body.status,body.id]);
    if (!result.rowCount) return NextResponse.json({error:"Report not found"},{status:404});
    return NextResponse.json({ok:true,report:result.rows[0]},{headers:{"Cache-Control":"no-store"}});
  } catch {return NextResponse.json({error:"Unable to update report"},{status:503});}
}
