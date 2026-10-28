import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { checkSameOrigin } from "../../../../lib/admin-auth";
import {staffAllowed,audit} from "../../../../lib/staff-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function PATCH(request) {
 const s=await staffAllowed(["safety_officer","transport_admin"]);if(!s)return NextResponse.json({error:"Unauthorized staff role"},{status:403});
 if(!checkSameOrigin(request)||(request.headers.get("content-type")||"").indexOf("application/json")===-1)return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const b=await request.json();
  if(!/^[a-f0-9-]{36}$/i.test(b.id||"")||!["reviewed","dismissed","pending"].includes(b.status))return NextResponse.json({error:"Invalid input"},{status:400});
  const r=await getDb().query("UPDATE public.dalan_reports SET status=$1,reviewed_at=CASE WHEN $1='pending' THEN NULL ELSE now() END WHERE id=$2 RETURNING id,status",[b.status,b.id]);
  if(!r.rowCount)return NextResponse.json({error:"Not found"},{status:404});
  await audit(s,"COMMUTER_REPORT_"+b.status.toUpperCase(),b.id);
  return NextResponse.json({ok:true,report:r.rows[0]},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Unable to update report"},{status:503});}
}
