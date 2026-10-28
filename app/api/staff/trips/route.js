import {NextResponse} from "next/server";
import {getDb} from "../../../../lib/db";
import {staffAllowed,audit} from "../../../../lib/staff-auth";
export const dynamic="force-dynamic";export const runtime="nodejs";
export async function GET(){
 const s=await staffAllowed(["safety_officer"]);if(!s)return NextResponse.json({error:"Safety staff authorization required"},{status:403});
 const r=await getDb().query("SELECT id,vehicle_type,destination_label,last_seen_at,expires_at,assistance_status,assistance_requested_at,admin_visibility FROM public.dalan_trip_shares WHERE expires_at>now() AND (admin_visibility=true OR assistance_status IN ('requested','acknowledged')) ORDER BY assistance_requested_at DESC NULLS LAST,last_seen_at DESC LIMIT 50");
 await audit(s,"SAFETY_TRIP_LIST",null,"Identifiers only; no GPS location");
 return NextResponse.json({trips:r.rows},{headers:{"Cache-Control":"no-store"}});
}
