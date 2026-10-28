import {NextResponse} from "next/server";
import {getDb} from "../../../../lib/db";
import {staffAllowed,audit} from "../../../../lib/staff-auth";
import {checkSameOrigin} from "../../../../lib/admin-auth";
export const dynamic="force-dynamic";export const runtime="nodejs";
const modes=new Set(["tricycle","jeepney","bus","van","walking","other"]);
export async function GET(req){
 const includeDraft=new URL(req.url).searchParams.get("includeDraft")==="true";
 const staff=includeDraft?await staffAllowed(["transport_admin"]):null;
 if(includeDraft&&!staff)return NextResponse.json({error:"Not authorized to view draft routes"},{status:403});
 const r=await getDb().query("SELECT id,route_code,route_name,mode,origin_label,destination_label,verification_status,source_reference,verified_at FROM public.dalan_transport_routes "+(staff?"":"WHERE verification_status='verified' ")+"ORDER BY route_name LIMIT 150");
 return NextResponse.json({routes:r.rows,notice:staff?"Internal route register. Drafts are not public guidance.":"Only officially reviewed/verified routes appear here."},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req){
 const s=await staffAllowed(["transport_admin"]);if(!s||!checkSameOrigin(req))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const raw=await req.text();if(raw.length>1700)return NextResponse.json({error:"Invalid payload"},{status:413});
  const b=JSON.parse(raw),code=String(b.code||"").trim().toUpperCase(),name=String(b.name||"").trim(),source=String(b.source||"").trim();
  const status=b.verified===true?"verified":"draft";
  if(!/^[A-Z0-9_-]{3,35}$/.test(code)||name.length<4||name.length>160||!modes.has(b.mode)||source.length>600||(status==="verified"&&source.length<12))return NextResponse.json({error:"Valid code, route name, transport type, and source required before verification"},{status:400});
  const r=await getDb().query("INSERT INTO public.dalan_transport_routes(route_code,route_name,mode,origin_label,destination_label,verification_status,source_reference,verified_at) VALUES($1,$2,$3,$4,$5,$6,$7,CASE WHEN $6='verified' THEN now() ELSE NULL END) RETURNING id",[code,name,b.mode,String(b.origin||"").slice(0,150)||null,String(b.destination||"").slice(0,150)||null,status,source||null]);
  await audit(s,"TRANSPORT_ROUTE_CREATED",r.rows[0].id,status);
  return NextResponse.json({ok:true,id:r.rows[0].id,status},{status:201});
 }catch{return NextResponse.json({error:"Unable to save route; code may be duplicated"},{status:409});}
}
