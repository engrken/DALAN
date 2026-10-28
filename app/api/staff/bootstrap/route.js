import {createHash} from "node:crypto";
import {NextResponse} from "next/server";
import {getDb} from "../../../../lib/db";
import {checkSameOrigin} from "../../../../lib/admin-auth";
import {hashPassword,issueStaffSession,safeCompareHex,strongEmail,validPassword} from "../../../../lib/staff-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const r=await getDb().query("SELECT EXISTS(SELECT 1 FROM public.dalan_staff WHERE role='super_admin') AS claimed");
 return NextResponse.json({claimed:r.rows[0].claimed},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request){
 if(!checkSameOrigin(request)||!(request.headers.get("content-type")||"").includes("application/json"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const raw=await request.text();if(raw.length>1100)return NextResponse.json({error:"Invalid input"},{status:400});
  const b=JSON.parse(raw),expected=process.env.DALAN_STAFF_BOOTSTRAP_HASH;
  const actual=typeof b.setupToken==="string"?createHash("sha256").update(b.setupToken).digest("hex"):"";
  if(!safeCompareHex(expected,actual))return NextResponse.json({error:"Invalid setup token"},{status:403});
  const name=String(b.name||"").trim(),email=String(b.email||"").trim().toLowerCase();
  if(name.length<2||name.length>90||!strongEmail(email)||!validPassword(b.password))return NextResponse.json({error:"Enter a name, email and unique passphrase of at least 14 characters"},{status:400});
  const r=await getDb().query("INSERT INTO public.dalan_staff(display_name,email,password_hash,role) SELECT $1,$2,$3,'super_admin' WHERE NOT EXISTS (SELECT 1 FROM public.dalan_staff WHERE role='super_admin') RETURNING id",[name,email,hashPassword(b.password)]);
  if(!r.rowCount)return NextResponse.json({error:"DALAN already has an initial administrator"},{status:409});
  const response=NextResponse.json({ok:true,role:"super_admin"});
  await issueStaffSession(response,r.rows[0].id);
  return response;
 }catch{return NextResponse.json({error:"Setup failed or already completed"},{status:503});}
}
