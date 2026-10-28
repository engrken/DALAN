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
 return {
  amountPhp:(total/100).toFixed(2),
  breakdown:{baseDistanceKm:Number(schedule.base_distance_km),basePhp:(base/100).toFixed(2),extraWholeKm:beyond,extraRatePhp:(rate/100).toFixed(2),additionalPhp:(extra/100).toFixed(2)},
  discrepancy:null
 };
}

export function fareExamplesForMeters(schedule,meters,passenger){
 if(!Number.isFinite(meters)||meters<0||meters>100000)throw new Error("Unsupported distance");
 const lo=Math.max(1,Math.floor(meters/1000)),hi=Math.max(1,Math.ceil(meters/1000));
 return [{kilometers:lo,amountPhp:fareForWholeKilometers(schedule,lo,passenger).amountPhp},{kilometers:hi,amountPhp:fareForWholeKilometers(schedule,hi,passenger).amountPhp}];
}
