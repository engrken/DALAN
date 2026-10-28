"use client";
import {useState} from "react";
import GpsFareMeter from "./GpsFareMeter";

const php=v=>"₱"+Number(v).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
export default function FareGuide({initialPassenger="Student"}){
 const map={Student:"student",Regular:"regular","Senior Citizen":"senior","Person with Disability":"pwd"};
 const [mode,setMode]=useState("tricycle"),[passenger,setPassenger]=useState(map[initialPassenger]||"regular"),[distance,setDistance]=useState("2"),[service,setService]=useState("ordinary");
 const [result,setResult]=useState(null),[busy,setBusy]=useState(false),[showFines,setShowFines]=useState(false);
 const [error,setError]=useState("");
 const [gpsTracking,setGpsTracking]=useState(false);
 function clear(){setResult(null);setError("");}
 async function calculate(e){
  e.preventDefault();clear();
  if(service!=="ordinary")return;
  if(!/^(?:[1-9]|[1-9][0-9]|100)$/.test(distance)){setError("Enter 1–100 whole kilometers. Fare rounding for fractional kilometers requires the posted official matrix.");return;}
  setBusy(true);
  try{
   const q=new URLSearchParams({mode,passenger,distanceKm:distance});
   const response=await fetch("/api/fare-guide?"+q.toString(),{cache:"no-store"});
   const body=await response.json();if(!response.ok)throw Error(body.error||"Fare guide unavailable");
   setResult(body);
  }catch(e){setError(e.message||"Could not calculate fare");}finally{setBusy(false);}
 }
 return <div className="fareGrid">
  <section className="primaryPanel"><div className="panelHead"><div><span className="eyebrow">DALAN FARE REFERENCE</span><h2>Calculate a sample fare</h2></div><span className="tinyTag">Provisional guide</span></div>
   <p className="helper">Based on the 2024 Roxas City tricycle schedule and the September 28, 2026 LTFRB traditional-jeepney guide. Only whole-kilometer examples are calculated until the official fractional-distance rule is confirmed. These are <strong>not</strong> live route distances or special-trip quotations.</p>
   <form onSubmit={calculate} className="fareForm">
    <label htmlFor="fare-mode">Transport service</label><select id="fare-mode" disabled={gpsTracking} className="fullInput" value={mode} onChange={e=>{setMode(e.target.value);clear();setDistance(e.target.value==="tricycle"?"2":"4");setShowFines(false)}}><option value="tricycle">Roxas City tricycle (ordinary/shared)</option><option value="jeepney">Traditional jeepney (not modern PUJ)</option></select>
    <label htmlFor="fare-service">Trip category</label><select id="fare-service" disabled={gpsTracking} className="fullInput" value={service} onChange={e=>{setService(e.target.value);clear();}}><option value="ordinary">Ordinary/shared ride fare</option><option value="special">Special / contracted trip</option></select>
    <label htmlFor="fare-passenger">Passenger category</label><select id="fare-passenger" disabled={gpsTracking} className="fullInput" value={passenger} onChange={e=>{setPassenger(e.target.value);clear();}}><option value="regular">Regular</option><option value="student">Student</option><option value="senior">Senior citizen</option><option value="pwd">Person with disability (PWD)</option></select>
    {service==="ordinary"&&<><label htmlFor="fare-distance">Journey distance — whole km only</label><input id="fare-distance" type="number" className="fullInput" min="1" max="100" step="1" required value={distance} onChange={e=>{setDistance(e.target.value);clear();}}/><p className="helper">Manual distance input; no GPS/map route distance is assumed or billed. Check the displayed fare matrix inside the vehicle.</p><button className="mainButton" type="submit" disabled={busy}>{busy?"Calculating…":"Calculate sample fare"}</button></>}
   </form>
   {service==="special"&&<div className="softNotice" role="status"><strong>No published special-trip rate in this dataset.</strong> DALAN will keep a separately labeled estimation module once its lawful basis and methodology are supplied. Do not use the ordinary/shared fare as a fixed quotation.</div>}
   {error&&<div className="result error" role="alert">{error}</div>}
   {result&&<div className="fareResult" role="status"><span className="eyebrow">PROVISIONAL AMOUNT</span><div className="fareAmount">{php(result.amountPhp)}</div><p>{result.distanceKm} whole km · {result.mode==="tricycle"?"Tricycle":"Traditional jeepney"} · {result.passenger.toUpperCase()}</p>
    <div className="fareLine"><span>First {result.breakdown.baseDistanceKm} km</span><b>{php(result.breakdown.basePhp)}</b></div>
    <div className="fareLine"><span>{result.breakdown.extraWholeKm} additional whole km × {php(result.breakdown.extraRatePhp)}</span><b>{php(result.breakdown.additionalPhp)}</b></div>
    <div className="fareLine total"><span>Provisional sample total</span><b>{php(result.amountPhp)}</b></div>
    <p className="fareWarning">{result.advisory}</p>
    <p className="helper"><b>Effective:</b> {String(result.schedule.effectiveFrom).slice(0,10)} · <b>Reference:</b> {result.schedule.source}</p>
    {result.schedule.sourceUrl&&<a className="fareSource" href={result.schedule.sourceUrl} target="_blank" rel="noopener noreferrer">Read supporting report ↗</a>}
    {result.mode==="tricycle"&&result.overchargingGuide&&<div className="fareSanctions"><button className="outlineButton" onClick={()=>setShowFines(!showFines)} type="button">{showFines?"Hide":"View"} supplied overcharging-penalty summary</button>{showFines&&<div><p className="fareWarning">Reported from user-supplied text of Ordinance No. 024-2024. Full ordinance text and applicability have not yet been independently verified; these are not automatic penalties in DALAN.</p>{result.overchargingGuide.items.map(x=><p key={x.offense} className="fareLine"><span>{x.offense===4?"4th and succeeding offenses":x.offense+(x.offense===1?"st":x.offense===2?"nd":"rd")+" offense"}</span><b>{x.finePhp?php(x.finePhp):x.action}</b></p>)}</div>}</div>}
   </div>}
   <GpsFareMeter mode={mode} passenger={passenger} service={service} onTrackingChange={setGpsTracking}/>
  </section>
  <aside className="sidePanel"><span className="eyebrow">CURRENT PROVIDED RATES</span><h2>Fare matrix at a glance</h2>
   <h3 className="fareMiniTitle">Tricycle · Ordinance 024-2024</h3><div className="dataRow"><span>First 2 km, regular</span><b>₱15.00</b></div><div className="dataRow"><span>First 2 km, eligible discount</span><b>₱10.00</b></div><div className="dataRow"><span>Every succeeding whole km</span><b>+₱5.00</b></div>
   <h3 className="fareMiniTitle">Traditional jeepney · Sep 28, 2026</h3><div className="dataRow"><span>First 4 km, regular</span><b>₱14.00</b></div><div className="dataRow"><span>First 4 km, discounted</span><b>₱11.25 <small>(LTFRB)</small></b></div><div className="dataRow"><span>Succeeding whole km, regular</span><b>+₱2.00</b></div><div className="dataRow"><span>Succeeding whole km, discounted</span><b>+₱1.60</b></div>
   <div className="sideNote"><strong>Student discount applies on weekends and holidays</strong> while eligible and enrolled, subject to the law and proof-of-eligibility requirements. <a href="https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/88836" target="_blank" rel="noopener noreferrer">RA 11314 ↗</a></div>
   <p className="helper">Discounts for tricycle rides follow the distinct city rates shown above. Do not apply another automatic 20% deduction to the ₱10.00 tricycle base. Modern jeepneys follow a different fare schedule.</p>
  </aside>
 </div>;
}
