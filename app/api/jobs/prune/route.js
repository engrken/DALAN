import {NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {getDb} from "../../../../lib/db";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request){
 const secret=process.env.CRON_SECRET||"",auth=request.headers.get("authorization")||"";
 const a=Buffer.from(auth),b=Buffer.from("Bearer "+secret);
 if(!secret||a.length!==b.length||!timingSafeEqual(a,b))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const db=getDb();
  const [trips,sessions]=await Promise.all([
   db.query("DELETE FROM public.dalan_trip_shares WHERE expires_at<=now()"),
   db.query("DELETE FROM public.dalan_staff_sessions WHERE expires_at<=now()")
  ]);
  return NextResponse.json({ok:true,expiredTripSessionsRemoved:trips.rowCount,expiredStaffSessionsRemoved:sessions.rowCount,timestamp:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Cleanup failed"},{status:503});}
}
