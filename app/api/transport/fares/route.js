import {NextResponse} from "next/server";
import {getDb} from "../../../../lib/db";
import {staffAllowed,audit} from "../../../../lib/staff-auth";
import {checkSameOrigin} from "../../../../lib/admin-auth";
export const dynamic="force-dynamic";export const runtime="nodejs";
const modes=new Set(["tricycle","jeepney","bus","van","other"]),passengers=new Set(["regular","student","senior","pwd"]),kinds=new Set(["flat","per_km","special_estimate"]);
export async function GET(req){
 const draft=new URL(req.url).searchParams.get("includeDraft")==="true";const staff=draft?await staffAllowed(["transport_admin"]):null;
 if(draft&&!staff)return NextResponse.json({error:"Forbidden"},{status:403});
 const r=await getDb().query("SELECT id,route_id,mode,passenger_type,fare_kind,distance_from_km,distance_to_km,amount_php,verification_status,source_reference,effective_from,effective_to,notes FROM public.dalan_fare_rules "+(staff?"":"WHERE verification_status='verified' AND (effective_from IS NULL OR effective_from<=CURRENT_DATE) AND (effective_to IS NULL OR effective_to>=CURRENT_DATE) ")+"ORDER BY created_at DESC LIMIT 300");
 return NextResponse.json({fares:r.rows,notice:staff?"Drafts are internal; estimated special fares must be clearly marked.":"Only approved fare schedules are returned. Special estimates never constitute an official fare."},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req){
 const s=await staffAllowed(["transport_admin"]);if(!s||!checkSameOrigin(req))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const raw=await req.text();if(raw.length>2300)return NextResponse.json({error:"Invalid payload"},{status:413});
  const b=JSON.parse(raw),source=String(b.source||"").trim(),notes=String(b.notes||"").trim();
  const amount=Number(b.amount);
  const status=b.verified===true?"verified":"draft";
  if(!modes.has(b.mode)||!passengers.has(b.passenger)||!kinds.has(b.kind)||!Number.isFinite(amount)||amount<0||amount>50000||notes.length>300||source.length>1200||(status==="verified"&&(!b.effectiveFrom||source.length<12))||(b.kind==="special_estimate"&&status==="verified"))return NextResponse.json({error:"Invalid fare rule; special-trip estimates may not be published as official"},{status:400});
  const r=await getDb().query("INSERT INTO public.dalan_fare_rules(route_id,mode,passenger_type,fare_kind,distance_from_km,distance_to_km,amount_php,verification_status,source_reference,effective_from,effective_to,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id",[b.routeId||null,b.mode,b.passenger,b.kind,b.minKm==null?null:Number(b.minKm),b.maxKm==null?null:Number(b.maxKm),amount,status,source||null,b.effectiveFrom||null,b.effectiveTo||null,notes||null]);
  await audit(s,"FARE_RULE_CREATED",r.rows[0].id,status);
  return NextResponse.json({ok:true,id:r.rows[0].id,status},{status:201});
 }catch{return NextResponse.json({error:"Unable to save fare; check route, dates, and values"},{status:400});}
}
