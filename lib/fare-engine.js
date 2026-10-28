// DALAN distance fare guide. No floating-point fare arithmetic: all fares use integer centavos.
// Do not silently round fractional distances; legal increment/rounding rule needs the official matrix.
export const passengerClasses = ["regular","student","senior","pwd"];
export function fareForWholeKilometers(schedule,distanceKm,passenger){
 if(!Number.isInteger(distanceKm)||distanceKm<1||distanceKm>100)throw new Error("Enter a whole-kilometer distance between 1 and 100. Fractional-distance billing requires the official fare guide.");
 if(!passengerClasses.includes(passenger))throw new Error("Unsupported passenger type");
 if(schedule.calculation_policy!=="whole_kilometers_only")throw new Error("This fare schedule is not supported by the current estimator");
 const discounted=passenger!=="regular";
 const base=Number(discounted?schedule.discount_base_cents:schedule.regular_base_cents);
 const rate=Number(discounted?schedule.discount_extra_cents:schedule.regular_extra_cents);
 const beyond=Math.max(0,distanceKm-Number(schedule.base_distance_km));
 const extra=beyond*rate,total=base+extra;
 if(![base,rate,extra,total].every(Number.isSafeInteger))throw new Error("Invalid fare schedule data");
 const discrepancy=discounted&&schedule.reported_alternative_discount_cents!=null
  ?{otherReportedMinimumPhp:(Number(schedule.reported_alternative_discount_cents)/100).toFixed(2),otherReportedTotalPhp:((Number(schedule.reported_alternative_discount_cents)+extra)/100).toFixed(2),message:"The user-supplied ₱11.20 discounted base differs from the ₱11.25 listed in the September 28, 2026 government fare report. Confirm the actual LTFRB posted fare matrix."}
  :null;
 return {
  amountPhp:(total/100).toFixed(2),
  breakdown:{baseDistanceKm:Number(schedule.base_distance_km),basePhp:(base/100).toFixed(2),extraWholeKm:beyond,extraRatePhp:(rate/100).toFixed(2),additionalPhp:(extra/100).toFixed(2)},
  discrepancy
 };
}
