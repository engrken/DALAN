import {NextResponse} from "next/server";
import {getDb} from "../../../../lib/db";
import {staffAllowed,audit} from "../../../../lib/staff-auth";
import {checkSameOrigin} from "../../../../lib/admin-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const s=await staffAllowed(["safety_officer"]);if(!s)return NextResponse.json({error:"Forbidden"},{status:403});
 const r=await getDb().query("SELECT id,vehicle_type,destination_label,last_seen_at,assistance_status,assistance_requested_at,assistance_note,expires_at FROM public.dalan_trip_shares WHERE assistance_status IN ('requested','acknowledged') AND expires_at>now() ORDER BY assistance_requested_at DESC LIMIT 50");
 await audit(s,"ASSISTANCE_QUEUE_VIEWED");return NextResponse.json({requests:r.rows},{headers:{"Cache-Control":"no-store"}});
}
export async function PATCH(req){
 const s=await staffAllowed(["safety_officer"]);if(!s||!checkSameOrigin(req))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const b=await req.json();if(!/^[a-f0-9-]{36}$/i.test(b.id||"")||!["acknowledged","resolved"].includes(b.status))return NextResponse.json({error:"Invalid action"},{status:400});
  const r=await getDb().query("UPDATE public.dalan_trip_shares SET assistance_status=$2 WHERE id=$1 AND expires_at>now() AND assistance_status IN ('requested','acknowledged') RETURNING id",[b.id,b.status]);
  if(!r.rowCount)return NextResponse.json({error:"Request unavailable"},{status:404});
  await audit(s,"ASSISTANCE_"+b.status.toUpperCase(),b.id,"Not a confirmed responder dispatch");
  return NextResponse.json({ok:true,notice:"Internal assistance status updated. No emergency services were notified."});
 }catch{return NextResponse.json({error:"Unable to update request"},{status:503});}
}
