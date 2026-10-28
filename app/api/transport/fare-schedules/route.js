import {NextResponse} from "next/server";
import {getDb} from "../../../../lib/db";
import {staffAllowed} from "../../../../lib/staff-auth";
export const dynamic="force-dynamic";export const runtime="nodejs";
export async function GET(){
 const staff=await staffAllowed(["transport_admin"]);
 if(!staff)return NextResponse.json({error:"Transport administration access required"},{status:403});
 try{
  const r=await getDb().query("SELECT schedule_code,mode,label,effective_from,verification_status,source_name,source_url,base_distance_km,regular_base_cents,discount_base_cents,regular_extra_cents,discount_extra_cents,reported_alternative_discount_cents,verification_notes FROM public.dalan_fare_schedules ORDER BY mode");
  return NextResponse.json({schedules:r.rows,note:"Source-reported provisional schedules; not an official signed tariff verification or special-trip quotation."},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Fare schedules unavailable"},{status:503});}
}
