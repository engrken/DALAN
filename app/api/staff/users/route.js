import {NextResponse} from "next/server";
import {getDb} from "../../../../lib/db";
import {checkSameOrigin} from "../../../../lib/admin-auth";
import {staffAllowed,allowedRoles,validPassword,strongEmail,hashPassword,audit} from "../../../../lib/staff-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const s=await staffAllowed(["super_admin"]);if(!s||s.role!=="super_admin")return NextResponse.json({error:"Forbidden"},{status:403});
 const r=await getDb().query("SELECT id,display_name,email,role,active,created_at FROM public.dalan_staff ORDER BY created_at DESC LIMIT 100");
 return NextResponse.json({staff:r.rows},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request){
 const s=await staffAllowed(["super_admin"]);if(!s||s.role!=="super_admin"||!checkSameOrigin(request))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const raw=await request.text();if(raw.length>1000)return NextResponse.json({error:"Invalid input"},{status:400});
  const b=JSON.parse(raw),email=String(b.email||"").trim().toLowerCase(),name=String(b.name||"").trim();
  if(!strongEmail(email)||name.length<2||name.length>90||!validPassword(b.password)||!allowedRoles.has(b.role)||b.role==="super_admin")return NextResponse.json({error:"Valid staff data and a 14+ character initial password required"},{status:400});
  const result=await getDb().query("INSERT INTO public.dalan_staff(display_name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id",[name,email,hashPassword(b.password),b.role]);
  await audit(s,"STAFF_CREATED",result.rows[0].id,b.role);
  return NextResponse.json({ok:true},{status:201});
 }catch{return NextResponse.json({error:"Cannot create staff account. Email may already be used."},{status:409});}
}
