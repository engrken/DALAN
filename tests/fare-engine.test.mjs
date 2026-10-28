import {test} from "node:test";
import assert from "node:assert/strict";
import {fareForWholeKilometers,fareExamplesForMeters} from "../lib/fare-engine.js";
const tri={base_distance_km:2,regular_base_cents:1500,discount_base_cents:1000,regular_extra_cents:500,discount_extra_cents:500,reported_alternative_discount_cents:null,calculation_policy:"whole_kilometers_only"};
const jeep={base_distance_km:4,regular_base_cents:1400,discount_base_cents:1125,regular_extra_cents:200,discount_extra_cents:160,reported_alternative_discount_cents:null,calculation_policy:"whole_kilometers_only"};
test("Roxas tricycle: base fares at 1 and 2km",()=>{assert.equal(fareForWholeKilometers(tri,1,"regular").amountPhp,"15.00");assert.equal(fareForWholeKilometers(tri,2,"student").amountPhp,"10.00");});
test("Roxas tricycle: surcharges are identical for regular and discounted classes",()=>{assert.equal(fareForWholeKilometers(tri,5,"regular").amountPhp,"30.00");assert.equal(fareForWholeKilometers(tri,5,"pwd").amountPhp,"25.00");assert.equal(fareForWholeKilometers(tri,5,"senior").amountPhp,"25.00");});
test("Jeepney regular base and succeeding kilometers",()=>{assert.equal(fareForWholeKilometers(jeep,4,"regular").amountPhp,"14.00");assert.equal(fareForWholeKilometers(jeep,5,"regular").amountPhp,"16.00");assert.equal(fareForWholeKilometers(jeep,10,"regular").amountPhp,"26.00");});
test("Jeepney provided discounted arithmetic stays exact centavos",()=>{assert.equal(fareForWholeKilometers(jeep,4,"student").amountPhp,"11.25");assert.equal(fareForWholeKilometers(jeep,5,"student").amountPhp,"12.85");assert.equal(fareForWholeKilometers(jeep,10,"senior").amountPhp,"20.85");});
test("GPS adjacent whole kilometer price examples do not claim legal fractional rounding",()=>{
 assert.deepEqual(fareExamplesForMeters(jeep,4550,"student"),[{kilometers:4,amountPhp:"11.25"},{kilometers:5,amountPhp:"12.85"}]);
 assert.deepEqual(fareExamplesForMeters(tri,2000,"regular"),[{kilometers:2,amountPhp:"15.00"},{kilometers:2,amountPhp:"15.00"}]);
 assert.throws(()=>fareExamplesForMeters(tri,-1,"regular"));
});
test("Fail closed on fractional distances or unsupported categories",()=>{assert.throws(()=>fareForWholeKilometers(tri,2.1,"regular"));assert.throws(()=>fareForWholeKilometers(jeep,0,"student"));assert.throws(()=>fareForWholeKilometers(jeep,5,"tourist"));});
