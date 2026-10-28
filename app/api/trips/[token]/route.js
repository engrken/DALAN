import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { checkSameOrigin } from "../../../../lib/admin-auth";
import { goodToken, tokenHash, isCoordinate, modeHints, noCache, purgeExpired } from "../../../../lib/trips";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(data,status=200)=>noCache(NextResponse.json(data,{status}));
export async function GET(_req,context){
 const {token}=await context.params;
 if(!goodToken(token))return json({error:"Invalid link"},404);
 try{
  const r=await getDb().query("SELECT expires_at,stopped_at,last_seen_at,last_lat,last_lng,last_accuracy_m,last_speed_kph,mode_hint,vehicle_type,plate_no,operator_label,share_vehicle_details,destination_label,last_checkin_at,next_checkin_at,assistance_status FROM public.dalan_trip_shares WHERE viewer_token_hash=$1",[tokenHash(token)]);
  if(!r.rows.length)return json({error:"Trip not available or already stopped"},404);
  const x=r.rows[0];if(new Date(x.expires_at)<=new Date()||x.stopped_at)return json({error:"This trip link has expired"},410);
  const age=x.last_seen_at?Date.now()-new Date(x.last_seen_at).getTime():null;
  return json({active:true,expiresAt:x.expires_at,lastSeenAt:x.last_seen_at,stale:age===null||age>45000,location:x.last_lat==null?null:{lat:x.last_lat,lng:x.last_lng,accuracyMeters:x.last_accuracy_m},speedKph:x.last_speed_kph,modeHint:x.mode_hint,vehicleType:x.vehicle_type,destination:x.destination_label,checkIn:{lastAt:x.last_checkin_at,nextDueAt:x.next_checkin_at,overdue:Boolean(x.next_checkin_at&&new Date(x.next_checkin_at)<new Date())},assistanceStatus:x.assistance_status,vehicle:x.share_vehicle_details?{plate:x.plate_no,operator:x.operator_label}:null});
 }catch{return json({error:"Unable to load live trip"},503);}
}
export async function PATCH(req,context){
 const {token}=await context.params;
 if(!goodToken(token)||!goodToken(req.headers.get("x-dalan-owner-token")))return json({error:"Unauthorized"},401);
 if(!checkSameOrigin(req)||(req.headers.get("content-type")||"").indexOf("application/json")===-1)return json({error:"Forbidden"},403);
 try{
  const text=await req.text();if(text.length>1000)return json({error:"Invalid request size"},413);
  const b=JSON.parse(text);if(!isCoordinate(b.lat,b.lng)||typeof b.accuracy!=="number"||b.accuracy<0||b.accuracy>2000||typeof b.capturedAt!=="number"||Math.abs(Date.now()-b.capturedAt)>30000)return json({error:"A recent valid GPS fix is required"},400);
  const mode=modeHints.has(b.modeHint)?b.modeHint:"unknown";
  const speed=typeof b.speedKph==="number"&&Number.isFinite(b.speedKph)&&b.speedKph>=0&&b.speedKph<=300?b.speedKph:null;
  const r=await getDb().query("UPDATE public.dalan_trip_shares SET last_seen_at=now(),last_lat=$3,last_lng=$4,last_accuracy_m=$5,last_speed_kph=$6,mode_hint=$7 WHERE viewer_token_hash=$1 AND owner_token_hash=$2 AND stopped_at IS NULL AND expires_at>now() AND (last_seen_at IS NULL OR last_seen_at<now()-interval '7 seconds') RETURNING id", [tokenHash(token),tokenHash(req.headers.get("x-dalan-owner-token")),b.lat,b.lng,Math.round(b.accuracy),speed,mode]);
  if(!r.rowCount)return json({ok:false,notice:"Not updated: session expired, unauthorized, or update too frequent"},409);
  return json({ok:true});
 }catch{return json({error:"Unable to update live location"},503);}
}
export async function DELETE(req,context){
 const {token}=await context.params;
 const owner=req.headers.get("x-dalan-owner-token");
 if(!goodToken(token)||!goodToken(owner))return json({error:"Unauthorized"},401);
 if(!checkSameOrigin(req))return json({error:"Forbidden"},403);
 try{const r=await getDb().query("DELETE FROM public.dalan_trip_shares WHERE viewer_token_hash=$1 AND owner_token_hash=$2 RETURNING id",[tokenHash(token),tokenHash(owner)]);return r.rowCount?json({ok:true,stopped:true}):json({error:"Trip unavailable"},404);}catch{return json({error:"Unable to stop shared trip"},503);}
}
