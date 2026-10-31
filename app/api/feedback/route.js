import { NextResponse } from "next/server";
import postgres from "postgres";

export const runtime = "nodejs";
const categories = new Set(["usability","bug","route-data","feature","accessibility","other"]);
const devices = new Set(["mobile","desktop","tablet","other"]);
export async function POST(request) {
 try {
  if (!process.env.DATABASE_URL) return NextResponse.json({error:"Feedback collection is not configured yet."},{status:503});
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 12000) return NextResponse.json({error:"Request too large."},{status:413});
  const body = await request.json();
  if (body.website) return NextResponse.json({ok:true});
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (!categories.has(body.category) || !devices.has(body.device) || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5 || comment.length < 15 || comment.length > 2000 || body.consent !== true)
   return NextResponse.json({error:"Please complete all required fields."},{status:400});
  const sql = postgres(process.env.DATABASE_URL,{max:1,connect_timeout:5,ssl:"require"});
  try { await sql`INSERT INTO uat_feedback (category,rating,comment,device,consent) VALUES (${body.category},${body.rating},${comment},${body.device},true)`; }
  finally { await sql.end(); }
  return NextResponse.json({ok:true},{status:201,headers:{"Cache-Control":"no-store"}});
 } catch (error) {
  console.error("Feedback submission failed",error?.code || "unknown");
  return NextResponse.json({error:"Unable to save feedback. Please try again later."},{status:500});
 }
}
