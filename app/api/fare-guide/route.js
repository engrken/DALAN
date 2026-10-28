import {NextResponse} from "next/server";
import {getDb} from "../../../lib/db";
import {fareForWholeKilometers,passengerClasses} from "../../../lib/fare-engine";
export const runtime="nodejs";export const dynamic="force-dynamic";
const modes={tricycle:"ROXAS_TRICYCLE_2024",jeepney:"PUJ_TRADITIONAL_2026_09"};
const respond=(payload,status=200)=>NextResponse.json(payload,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(request){
 try{
  const params=new URL(request.url).searchParams;
  const mode=params.get("mode");
  const passenger=params.get("passenger")||"regular";
  const requested=params.get("distanceKm");
  if(!Object.hasOwn(modes,mode))return respond({error:"Select tricycle or traditional jeepney"},400);
  if(!passengerClasses.includes(passenger))return respond({error:"Invalid passenger category"},400);
  if(!requested||!/^(?:[1-9]|[1-9][0-9]|100)$/.test(requested))return respond({error:"Enter a whole-kilometer distance from 1 to 100. Fractional kilometers require official rounding-rule confirmation."},422);
  const distanceKm=Number(requested);
  const db=getDb();
  const result=await db.query("SELECT * FROM public.dalan_fare_schedules WHERE schedule_code=$1 AND verification_status IN ('provisional','verified') AND effective_from<=CURRENT_DATE",[modes[mode]]);
  if(!result.rowCount)return respond({error:"No applicable fare schedule currently available"},404);
  const s=result.rows[0];const computation=fareForWholeKilometers(s,distanceKm,passenger);
  const response={
   mode,passenger,distanceKm,...computation,
   status:s.verification_status,
   schedule:{label:s.label,code:s.schedule_code,effectiveFrom:s.effective_from,source:s.source_name,sourceUrl:s.source_url,note:s.verification_notes,discountNote:s.discount_description},
   advisory:s.verification_status==="verified"?"Check applicable vehicle fare matrix and special service conditions.":"PROVISIONAL FARE GUIDE — supplied rates are stored and matched against public reports, but full official matrix and rounding/discount discrepancy still need confirmation. Do not treat as legally certified collection amounts.",
   specialTrip:"No special-trip rate is configured. Do not use this regular fare estimate to price a contracted or special journey."
  };
  if(mode==="tricycle"){
   const penalties=await db.query("SELECT offense_number,fine_cents,license_action,legal_verification_status FROM public.dalan_tricycle_overcharge_guidance ORDER BY offense_number");
   response.overchargingGuide={status:"User-supplied summary; official ordinance full text not verified",items:penalties.rows.map(x=>({offense:x.offense_number,finePhp:x.fine_cents==null?null:(x.fine_cents/100).toFixed(2),action:x.license_action}))};
  }
  return respond(response);
 }catch{return respond({error:"The fare guide is temporarily unavailable"},503);}
}
