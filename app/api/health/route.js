import {NextResponse} from "next/server";
import {getDb} from "../../../lib/db";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 let database="unavailable";
 try{await getDb().query("SELECT 1 AS ok");database="connected";}catch{}
 return NextResponse.json({service:"dalan",status:database==="connected"?"ok":"degraded",phase:"private-pilot",database,verifiedRoutes:0,liveTransportData:false,timestamp:new Date().toISOString()},{status:database==="connected"?200:503,headers:{"Cache-Control":"no-store"}});
}
