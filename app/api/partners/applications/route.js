import {NextResponse} from "next/server";
import {getDb} from "../../../../lib/db";
import {staffAllowed,audit} from "../../../../lib/staff-auth";
import {checkSameOrigin} from "../../../../lib/admin-auth";
export const dynamic="force-dynamic";export const runtime="nodejs";
const types=new Set(["tricycle","jeepney","bus","van","other"]);
export async function GET(){
 const s=await staffAllowed(["operator_manager"]);if(!s)return NextResponse.json({error:"Forbidden"},{status:403});
 const r=await getDb().query("SELECT id,organization,contact_email,transport_mode,route_notes,vehicle_body_number,status,created_at FROM public.dalan_operator_applications ORDER BY created_at DESC LIMIT 100");
 await audit(s,"OPERATOR_APPLICATIONS_VIEWED");
 return NextResponse.json({applications:r.rows},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req){
 if(!checkSameOrigin(req)||(req.headers.get("content-type")||"").indexOf("application/json")===-1)return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const raw=await req.text();if(raw.length>1600)return NextResponse.json({error:"Payload too large"},{status:413});
  const b=JSON.parse(raw),name=String(b.organization||"").trim(),email=String(b.email||"").trim().toLowerCase(),route=String(b.route||"").trim(),body=String(b.bodyNumber||"").trim();
  if(b.consent!==true||b.website||name.length<3||name.length>130||email.length>180||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!types.has(b.mode)||route.length>320||body.length>40)return NextResponse.json({error:"Please complete valid operator information and consent"},{status:400});
  const db=getDb();const previous=await db.query("SELECT count(*)::int AS count FROM public.dalan_operator_applications WHERE contact_email=$1 AND created_at>now()-interval '24 hours'",[email]);
  if(previous.rows[0].count>=2)return NextResponse.json({error:"An application was recently submitted for this contact. Try later."},{status:429});
  await db.query("INSERT INTO public.dalan_operator_applications(organization,contact_email,transport_mode,route_notes,vehicle_body_number) VALUES($1,$2,$3,$4,$5)",[name,email,b.mode,route||null,body||null]);
  return NextResponse.json({ok:true,notice:"Operator application received for review; no verification or active operator account has been granted."},{status:201});
 }catch{return NextResponse.json({error:"Application unavailable"},{status:503});}
}
export async function PATCH(req){
 const s=await staffAllowed(["operator_manager"]);if(!s||!checkSameOrigin(req))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const b=await req.json();if(!/^[a-f0-9-]{36}$/i.test(b.id||"")||!["approved","rejected","pending"].includes(b.status))return NextResponse.json({error:"Invalid request"},{status:400});
  const r=await getDb().query("UPDATE public.dalan_operator_applications SET status=$1,reviewed_by=$2 WHERE id=$3 RETURNING id",[b.status,s.id,b.id]);
  if(!r.rowCount)return NextResponse.json({error:"Not found"},{status:404});
  await audit(s,"OPERATOR_APPLICATION_"+b.status.toUpperCase(),b.id);
  return NextResponse.json({ok:true,notice:"Application review status updated; no official transport license verification is implied."});
 }catch{return NextResponse.json({error:"Unable to update"},{status:503});}
}
