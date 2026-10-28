import {NextResponse} from "next/server";
import {getDb} from "../../../lib/db";
import {fareForWholeKilometers,passengerClasses} from "../../../lib/fare-engine";
export const runtime="nodejs";export const dynamic="force-dynamic";
const codes={tricycle:"ROXAS_TRICYCLE_2024",jeepney:"PUJ_TRADITIONAL_2026_09"};
const respond=(x,status=200)=>NextResponse.json(x,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(req){
 const p=new URL(req.url).searchParams,mode=p.get("mode"),passenger=p.get("passenger"),raw=p.get("distanceMeters");
 if(!Object.hasOwn(codes,mode)||!passengerClasses.includes(passenger)||typeof raw!=="string"||!/^\d{1,6}(?:\.\d{1,2})?$/.test(raw))return respond({error:"Specify valid mode, passenger and distance in meters"},422);
 const meters=Number(raw);if(!Number.isFinite(meters)||meters<0||meters>100000)return respond({error:"Distance outside pilot range"},422);
 try{
  const r=await getDb().query("SELECT * FROM public.dalan_fare_schedules WHERE schedule_code=$1 AND verification_status IN ('provisional','verified') AND effective_from<=CURRENT_DATE",[codes[mode]]);
  if(!r.rowCount)return respond({error:"Fare schedule unavailable"},404);
  const bottom=Math.max(1,Math.floor(meters/1000)),top=Math.max(1,Math.ceil(meters/1000)),s=r.rows[0];
  const low=fareForWholeKilometers(s,bottom,passenger),high=fareForWholeKilometers(s,top,passenger);
  return respond({
   mode,passenger,measuredKm:(meters/1000).toFixed(3),distanceMeters:Math.round(meters),
   scenarios:[{kilometers:bottom,amountPhp:low.amountPhp},{kilometers:top,amountPhp:high.amountPhp}],
   sameFare:low.amountPhp===high.amountPhp,source:s.source_name,rateStatus:s.verification_status,
   warning:"These are hypothetical adjacent WHOLE-KILOMETER fare examples, not a legally established fare range. GPS movement may omit slow travel or coverage gaps and differs from official franchised-route distance. The legally applicable rule for fractional kilometers, vehicle class, and route or special-trip conditions must be confirmed. No automatic charges.",
   privacy:"Raw coordinates, route history and plate details are never sent by this GPS fare estimator. Only measured distance in meters, passenger category and transport mode are sent to calculate these examples."
  });
 }catch{return respond({error:"GPS fare service temporarily unavailable"},503);}
}
