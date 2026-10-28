import {NextResponse} from "next/server";
import {getDb} from "../../../../../lib/db";
import {checkSameOrigin} from "../../../../../lib/admin-auth";
import {goodToken,tokenHash,noCache} from "../../../../../lib/trips";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(req,ctx){
 const {token}=await ctx.params,owner=req.headers.get("x-dalan-owner-token");
 const json=(v,status=200)=>noCache(NextResponse.json(v,{status}));
 if(!goodToken(token)||!goodToken(owner))return json({error:"Unauthorized"},401);
 if(!checkSameOrigin(req))return json({error:"Invalid origin"},403);
 try{
  const raw=await req.text();if(raw.length>650)return json({error:"Invalid request"},400);
  const b=JSON.parse(raw),action=String(b.action||"");
  const db=getDb();const args=[tokenHash(token),tokenHash(owner)];
  let sql;
  if(action==="grant_admin"){if(b.confirm!==true)return json({error:"Explicit safety monitoring consent required"},400);sql="UPDATE public.dalan_trip_shares SET admin_visibility=true,admin_consent_at=now() WHERE viewer_token_hash=$1 AND owner_token_hash=$2 AND expires_at>now() RETURNING id";}
  else if(action==="revoke_admin"){sql="UPDATE public.dalan_trip_shares SET admin_visibility=false,admin_consent_at=NULL WHERE viewer_token_hash=$1 AND owner_token_hash=$2 AND expires_at>now() AND assistance_status NOT IN ('requested','acknowledged') RETURNING id";}
  else if(action==="check_in"){sql="UPDATE public.dalan_trip_shares SET last_checkin_at=now(),next_checkin_at=now()+checkin_minutes * interval '1 minute' WHERE viewer_token_hash=$1 AND owner_token_hash=$2 AND expires_at>now() RETURNING id";}
  else if(action==="request_assistance"){if(b.confirm!==true)return json({error:"Confirm sharing with DALAN safety staff"},400);const note=String(b.note||"").trim();if(note.length>300)return json({error:"Note too long"},400);args.push(note||null);sql="UPDATE public.dalan_trip_shares SET assistance_status='requested',assistance_requested_at=now(),assistance_note=$3,admin_visibility=true,admin_consent_at=now() WHERE viewer_token_hash=$1 AND owner_token_hash=$2 AND expires_at>now() RETURNING id";}
  else if(action==="cancel_assistance"){sql="UPDATE public.dalan_trip_shares SET assistance_status='none',assistance_requested_at=NULL,assistance_note=NULL,admin_visibility=false,admin_consent_at=NULL WHERE viewer_token_hash=$1 AND owner_token_hash=$2 AND expires_at>now() RETURNING id";}
  else return json({error:"Unknown safety action"},400);
  const result=await db.query(sql,args);if(!result.rowCount)return json({error:"Session expired or action not currently allowed. Cancel assistance before revoking monitoring."},409);
  return json({ok:true,action,notice:action==="request_assistance"?"Submitted to DALAN's internal queue. Not an emergency dispatch or guaranteed immediate response.":undefined});
 }catch{return json({error:"Safety action failed"},503);}
}
