import {test} from "node:test";
import assert from "node:assert/strict";
import {greatCircleMeters,filterGpsFix} from "../lib/gps-distance.js";
const now=Date.now(),start={lat:11.585,lng:122.751,accuracy:5,timestamp:now-12000},end={lat:11.5859,lng:122.751,accuracy:5,timestamp:now};
test("GPS filter counts plausible movement",()=>{const r=filterGpsFix(start,end);assert.equal(r.accepted,true);assert.ok(r.meters>90&&r.meters<110);});
test("Stationary GPS jitter not counted",()=>{const r=filterGpsFix(start,{...start,lat:start.lat+.00001,timestamp:now});assert.equal(r.accepted,false);});
test("Poor accuracy or unrealistic jumps are rejected",()=>{assert.equal(filterGpsFix(start,{...end,accuracy:130}).accepted,false);assert.equal(filterGpsFix(start,{...end,lat:11.695}).accepted,false);});
test("Long GPS gap never bridged",()=>{const r=filterGpsFix({...start,timestamp:now-90000},end);assert.equal(r.accepted,true);assert.equal(r.meters,0);assert.equal(r.gap,true);});
test("Haversine identical points exactly zero",()=>assert.equal(greatCircleMeters(start,start),0));
