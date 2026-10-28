import {NextResponse} from "next/server";
import {checkSameOrigin} from "../../../../lib/admin-auth";
import {getDb} from "../../../../lib/db";
import {getStaff,validPassword,verifyPassword,hashPassword,audit} from "../../../../lib/staff-auth";
export const runtime="nodejs";
export async function POST(req){
 const s=await getStaff();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!checkSameOrigin(req))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const b=await req.json();if(!validPassword(b.newPassword)||typeof b.oldPassword!=="string")return NextResponse.json({error:"New password must contain at least 14 characters"},{status:400});
  const result=await getDb().query("SELECT password_hash FROM public.dalan_staff WHERE id=$1",[s.id]);
  if(!verifyPassword(b.oldPassword,result.rows[0]?.password_hash))return NextResponse.json({error:"Incorrect existing password"},{status:403});
  await getDb().query("UPDATE public.dalan_staff SET password_hash=$1 WHERE id=$2",[hashPassword(b.newPassword),s.id]);
  await audit(s,"PASSWORD_CHANGED",s.id);
  await getDb().query("DELETE FROM public.dalan_staff_sessions WHERE staff_id=$1",[s.id]);
  const res=NextResponse.json({ok:true,signInAgain:true});res.cookies.set("dalan_staff_v2","",{path:"/",maxAge:0});return res;
 }catch{return NextResponse.json({error:"Unable to change password"},{status:503});}
}
