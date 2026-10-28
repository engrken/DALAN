import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getDb} from "../../../../lib/db";
import {checkSameOrigin} from "../../../../lib/admin-auth";
import {STAFF_COOKIE,getStaff,issueStaffSession,verifyPassword,safeStaffData,tokenHash} from "../../../../lib/staff-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const staff=await getStaff();return NextResponse.json({staff:staff?safeStaffData(staff):null},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request){
 if(!checkSameOrigin(request)||!(request.headers.get("content-type")||"").includes("application/json"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const text=await request.text();if(text.length>650)return NextResponse.json({error:"Invalid request"},{status:400});
  const {email,password}=JSON.parse(text);const key=String(email||"").trim().toLowerCase();
  if(key.length>180||!key.includes("@")||typeof password!=="string"||password.length>128)return NextResponse.json({error:"Invalid credentials"},{status:401});
  const db=getDb();const lock=await db.query("SELECT failed_count,locked_until FROM public.dalan_staff_attempts WHERE email=$1",[key]);
  if(lock.rows[0]?.locked_until&&new Date(lock.rows[0].locked_until)>new Date())return NextResponse.json({error:"Too many attempts. Try again later."},{status:429});
  const r=await db.query("SELECT * FROM public.dalan_staff WHERE email=$1 AND active=true",[key]);const row=r.rows[0];
  if(!row||!verifyPassword(password,row.password_hash)){
   await db.query("INSERT INTO public.dalan_staff_attempts(email,failed_count,locked_until) VALUES ($1,1,NULL) ON CONFLICT(email) DO UPDATE SET failed_count=CASE WHEN public.dalan_staff_attempts.locked_until>now() THEN public.dalan_staff_attempts.failed_count ELSE public.dalan_staff_attempts.failed_count+1 END,locked_until=CASE WHEN public.dalan_staff_attempts.failed_count+1>=5 THEN now()+interval '15 minutes' ELSE NULL END",[key]);
   return NextResponse.json({error:"Invalid credentials"},{status:401});
  }
  await db.query("DELETE FROM public.dalan_staff_attempts WHERE email=$1",[key]);
  const response=NextResponse.json({ok:true,staff:safeStaffData(row)},{headers:{"Cache-Control":"no-store"}});
  await issueStaffSession(response,row.id);
  return response;
 }catch{return NextResponse.json({error:"Login temporarily unavailable"},{status:503});}
}
export async function DELETE(request){
 if(!checkSameOrigin(request))return NextResponse.json({error:"Forbidden"},{status:403});
 const token=(await cookies()).get(STAFF_COOKIE)?.value;
 if(/^[0-9a-f]{64}$/.test(token||""))await getDb().query("DELETE FROM public.dalan_staff_sessions WHERE token_hash=$1",[tokenHash(token)]);
 const res=NextResponse.json({ok:true});res.cookies.set(STAFF_COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:0});return res;
}
