import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { checkSameOrigin } from "../../../lib/admin-auth";
import { newToken, tokenHash, isCoordinate, vehicleTypes, noCache, purgeExpired } from "../../../lib/trips";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json=(data,status=200)=>noCache(NextResponse.json(data,{status}));
export async function POST(req){
 if(!checkSameOrigin(req) || !(req.headers.get("content-type")||"").includes("application/json")) return json({error:"Invalid request origin or type"},403);
 try{
  const text=await req.text();if(text.length>1800)return json({error:"Invalid request size"},413);
  const body=JSON.parse(text);
  if(body.consent!==true || !isCoordinate(body.lat,body.lng))return json({error:"Location-sharing consent and valid coordinates are required"},400);
  if(typeof body.accuracy!=="number"||body.accuracy<0||body.accuracy>2000)return json({error:"Please acquire a fresh, sufficiently accurate GPS location"},400);
  if(typeof body.capturedAt!=="number"||Math.abs(Date.now()-body.capturedAt)>30000)return json({error:"Please refresh your device location before sharing"},400);
  if(!vehicleTypes.has(body.vehicleType))return json({error:"Unsupported vehicle type"},400);
  const plate=String(body.plate||"").trim().toUpperCase();
  const operator=String(body.operator||"").trim();
  const destination=String(body.destination||"").trim();
  if(plate.length>20||operator.length>80||destination.length>120||(!/^[A-Z0-9 -]*$/.test(plate)))return json({error:"Please shorten or correct the vehicle information"},400);
  const duration=60;
  const adminMonitoring=body.adminMonitoring===true && body.adminConsent===true;
  const viewerToken=newToken(),ownerToken=newToken();
  await purgeExpired();
  const result=await getDb().query(
   "INSERT INTO public.dalan_trip_shares (viewer_token_hash,owner_token_hash,expires_at,last_seen_at,last_lat,last_lng,last_accuracy_m,vehicle_type,plate_no,operator_label,share_vehicle_details,destination_label,admin_visibility,admin_consent_at,last_checkin_at,next_checkin_at) VALUES ($1,$2,now()+interval '60 minutes',now(),$3,$4,$5,$6,$7,$8,$9,$10,$11,CASE WHEN $11 THEN now() ELSE NULL END,now(),now()+interval '15 minutes') RETURNING id,expires_at",
   [tokenHash(viewerToken),tokenHash(ownerToken),body.lat,body.lng,Math.round(body.accuracy),body.vehicleType,plate||null,operator||null,body.shareVehicleDetails===true,destination||null,adminMonitoring]
  );
  return json({ok:true,viewerToken,ownerToken,tripId:result.rows[0].id,expiresAt:result.rows[0].expires_at,validForMinutes:duration},201);
 }catch{return json({error:"Unable to create a live trip. Try again."},503);}
}
