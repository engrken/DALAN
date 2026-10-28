import {NextResponse} from "next/server";
import {getDb} from "../../../../../lib/db";
import {staffAllowed,audit} from "../../../../../lib/staff-auth";
export const dynamic="force-dynamic";export const runtime="nodejs";
export async function GET(_request,ctx){
 const s=await staffAllowed(["safety_officer"]);if(!s)return NextResponse.json({error:"Forbidden"},{status:403});
 const {id}=await ctx.params;if(!/^[a-f0-9-]{36}$/i.test(id))return NextResponse.json({error:"Invalid trip"},{status:404});
 try{
  const r=await getDb().query("SELECT id,vehicle_type,destination_label,last_seen_at,last_lat,last_lng,last_accuracy_m,expires_at,assistance_status,assistance_note,plate_no,operator_label,share_vehicle_details FROM public.dalan_trip_shares WHERE id=$1 AND expires_at>now() AND (admin_visibility=true OR assistance_status IN ('requested','acknowledged'))",[id]);
  if(!r.rows.length)return NextResponse.json({error:"Not authorized or trip expired"},{status:404});
  await audit(s,"PRECISE_TRIP_LOCATION_VIEWED",id,"Explicitly permitted trip GPS access");
  const x=r.rows[0];return NextResponse.json({id:x.id,vehicleType:x.vehicle_type,destination:x.destination_label,lastSeenAt:x.last_seen_at,expiresAt:x.expires_at,location:x.last_lat==null?null:{lat:x.last_lat,lng:x.last_lng,accuracy:x.last_accuracy_m},stale:!x.last_seen_at||Date.now()-new Date(x.last_seen_at).getTime()>45000,assistanceStatus:x.assistance_status,assistanceNote:x.assistance_note,vehicle:x.share_vehicle_details?{plate:x.plate_no,operator:x.operator_label}:null},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Location unavailable"},{status:503});}
}
