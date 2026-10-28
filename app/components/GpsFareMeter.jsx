"use client";
import {useEffect,useRef,useState} from "react";
import {filterGpsFix} from "../../lib/gps-distance";
const php=v=>"₱"+Number(v).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
export default function GpsFareMeter({mode,passenger,service,onTrackingChange}){
 const [consent,setConsent]=useState(false),[phase,setPhase]=useState("off"),[meters,setMeters]=useState(0),[samples,setSamples]=useState(0),[rejected,setRejected]=useState(0),[accuracy,setAccuracy]=useState(null),[notice,setNotice]=useState("Location measurement is off."),[estimate,setEstimate]=useState(null),[apiError,setApiError]=useState("");
 const watch=useRef(null),anchor=useRef(null),total=useRef(0),fixes=useRef(0),phaseRef=useRef("off"),mounted=useRef(false),lastQuery=useRef(0),lastBand=useRef(""),sequence=useRef(0);
 function setMode(x){phaseRef.current=x;setPhase(x);}
 function clearWatch(){if(watch.current!==null&&navigator.geolocation)navigator.geolocation.clearWatch(watch.current);watch.current=null;}
 function pause(note="Paused. Resume manually; missing movement will not be added."){clearWatch();anchor.current=null;setMode("paused");setNotice(note);}
 useEffect(()=>{
  mounted.current=true;
  const hidden=()=>{if(document.hidden&&phaseRef.current==="recording")pause("The app was hidden, so measurement paused. Reopen DALAN and resume manually.");};
  document.addEventListener("visibilitychange",hidden);
  return()=>{mounted.current=false;clearWatch();document.removeEventListener("visibilitychange",hidden);};
 },[]);
 useEffect(()=>{onTrackingChange?.(phase==="recording");},[phase,onTrackingChange]);
 useEffect(()=>{
  if(samples<2||phase==="off")return;
  const rounded=Math.min(100000,Math.round(meters*100)/100),band=Math.floor(rounded/1000)+":"+Math.ceil(rounded/1000)+":"+mode+":"+passenger;
  if(band===lastBand.current)return;
  if(Date.now()-lastQuery.current<5000)return;
  lastBand.current=band;lastQuery.current=Date.now();
  const seq=++sequence.current;
  const search=new URLSearchParams({mode,passenger,distanceMeters:rounded.toFixed(2)});
  fetch("/api/gps-fare?"+search,{cache:"no-store"}).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error||"Estimator unavailable");if(mounted.current&&seq===sequence.current){setEstimate(j);setApiError("");}}).catch(e=>{if(mounted.current&&seq===sequence.current)setApiError(e.message);});
 },[meters,samples,phase,mode,passenger]);
 function start(resume){
  if(!consent||service!=="ordinary"){setNotice("Consent and ordinary/shared trip mode are required.");return;}
  if(!navigator.geolocation){setNotice("Your browser does not offer GPS.");return;}
  if(!resume){total.current=0;fixes.current=0;setMeters(0);setSamples(0);setRejected(0);setEstimate(null);sequence.current++;lastBand.current="";lastQuery.current=0;}
  anchor.current=null;clearWatch();setMode("recording");setNotice("Requesting device location. Keep this page in the foreground.");
  watch.current=navigator.geolocation.watchPosition(p=>{
   if(phaseRef.current!=="recording")return;
   const c=p.coords,fix={lat:c.latitude,lng:c.longitude,accuracy:c.accuracy,timestamp:p.timestamp,speedMps:c.speed!=null&&c.speed>=0?c.speed:null};
   const result=filterGpsFix(anchor.current,fix);
   if(!result.accepted){setRejected(n=>n+1);setNotice(result.reason+" — waiting for reliable GPS.");return;}
   anchor.current=result.anchor;fixes.current++;setSamples(fixes.current);setAccuracy(Math.round(c.accuracy));
   if(result.meters>0){total.current+=result.meters;setMeters(total.current);}
   setNotice(result.gap?"GPS gap: unobserved distance was not counted.":"On-device GPS measurement active.");
   if(total.current>=100000)pause("Reached 100 km pilot limit.");
  },error=>{if(error.code===1)pause("Location access denied or revoked. Measurement stopped.");else setNotice(error.code===3?"Location timed out; GPS distance may be underestimated.":"GPS unavailable temporarily; missing movement may be underestimated.");},{enableHighAccuracy:true,maximumAge:0,timeout:20000});
 }
 function stop(){clearWatch();anchor.current=null;setMode("stopped");setNotice("Trip measurement ended. Numbers remain here until reset or navigation away.");}
 function reset(){clearWatch();anchor.current=null;total.current=0;fixes.current=0;sequence.current++;lastBand.current="";lastQuery.current=0;setMeters(0);setSamples(0);setRejected(0);setAccuracy(null);setEstimate(null);setApiError("");setMode("off");setNotice("Reset. No GPS coordinates or journey history were stored.");}
 return <section className="gpsMeter">
  <div className="gpsMeterTop"><div><span className="eyebrow">OPTIONAL GPS FARE METER</span><h3>Estimate from traveled distance</h3></div><span className="tinyTag">{phase==="recording"?"Active":phase==="paused"?"Paused":phase==="stopped"?"Ended":"Off"}</span></div>
  <p className="helper">Measures accepted GPS movement between successive positions <strong>on your phone</strong>, while this tab is active. Not the straight-line distance between locations. Poor GPS fixes are filtered, but slow movement, detours and signal gaps can make the recorded distance differ from the fare distance.</p>
  <label className="checkRow"><input type="checkbox" checked={consent} disabled={phase==="recording"} onChange={e=>setConsent(e.target.checked)}/><span>I voluntarily allow DALAN to use my GPS to measure this trip on my device. I can stop at any time. This meter does not share my coordinates with the administrator or my contacts.</span></label>
  <div className="gpsReading"><small>Observed distance</small><strong>{(meters/1000).toFixed(2)} <span>km</span></strong><small>{samples} accepted GPS fixes · {rejected} rejected{accuracy==null?"":" · ±"+accuracy+"m current reported accuracy"}</small></div>
  <div className="gpsButtons">{phase==="off"||phase==="stopped"?<button type="button" className="mainButton" disabled={!consent||service!=="ordinary"} onClick={()=>start(false)}>Start GPS meter</button>:phase==="recording"?<button type="button" className="outlineButton" onClick={()=>pause()}>Pause</button>:<button type="button" className="mainButton" disabled={!consent} onClick={()=>start(true)}>Resume GPS meter</button>}{["recording","paused"].includes(phase)&&<button type="button" className="outlineButton" onClick={stop}>End trip</button>}<button type="button" className="outlineButton" disabled={phase==="off"&&meters===0} onClick={reset}>Reset</button></div>
  <p className="gpsStatus" role="status">{notice}</p>
  {estimate&&<div className="gpsFareResult"><span className="eyebrow">HYPOTHETICAL WHOLE-KILOMETER SCENARIOS · NOT A CHARGE</span><div className="gpsFareOptions">{estimate.scenarios.map((x,i)=><div key={i}><small>{x.kilometers} km example</small><strong>{php(x.amountPhp)}</strong></div>)}</div>{estimate.sameFare&&<p className="helper">Both scenarios produce the same fare at the current distance.</p>}<p className="fareWarning">{estimate.warning}</p><p className="helper">{estimate.privacy}</p></div>}
  {apiError&&<p className="result error" role="alert">{apiError}</p>}
  <p className="helper">For a special trip, DALAN does not produce a GPS fare quotation. The actual payable fare must follow the applicable official route/transport fare matrix. When you lock the phone or switch apps, this browser meter pauses.</p>
 </section>;
}
