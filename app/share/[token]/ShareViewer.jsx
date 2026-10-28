"use client";
import {useEffect,useState} from "react";
import DalanMap from "../../components/DalanMap";
export default function ShareViewer({token}){
 const [data,setData]=useState(null),[message,setMessage]=useState("Loading shared trip…");
 useEffect(()=>{
  let stop=false;
  async function refresh(){
   if(document.hidden)return;
   try{const r=await fetch("/api/trips/"+encodeURIComponent(token),{cache:"no-store"});const j=await r.json();if(stop)return;if(!r.ok){setData(null);setMessage(j.error||"Trip unavailable");return;}setData(j);setMessage("");}catch{if(!stop)setMessage("Can't connect. Showing last received location, if available.");}
  }
  refresh();const timer=setInterval(refresh,15000);return()=>{stop=true;clearInterval(timer);};
 },[token]);
 const stale=data&&(data.stale||Date.now()-new Date(data.lastSeenAt).getTime()>45000);
 return <main className="sharedPage"><header className="sharedTop"><a href="/" className="brandLink"><span className="brandIcon">D</span><span>DALAN<small>Family / trusted contact</small></span></a><span className="tinyTag">Restricted pilot</span></header><section className="sharedIntro"><span className="eyebrow">TEMPORARY TRIP LOCATION</span><h1>Shared journey</h1><p>This map shows the last location provided by the traveler—not verified safety or exact arrival time.</p></section>{message&&<div role="status" className="liveStatus">{message}</div>}
 {data&&<><div className="shareGrid"><div><DalanMap position={data.location} label="Last trip location"/><p className={stale?"shareStale":"shareFresh"}>{stale?"⚠ Location may be stale. Do not assume the traveler is here now.":"● Recently updated location"}</p></div><aside className="liveAside"><span className="eyebrow">TRIP DETAILS</span><h2>Last update</h2><p>{data.lastSeenAt?new Date(data.lastSeenAt).toLocaleString("en-PH",{timeZone:"Asia/Manila"}):"No update yet"}</p><div className="dataRow"><span>GPS accuracy</span><b>{data.location?.accuracyMeters!=null?"±"+data.location.accuracyMeters+" m":"Unknown"}</b></div><div className="dataRow"><span>Declared transport</span><b>{data.vehicleType||"Unknown"}</b></div><div className="dataRow"><span>Movement hint</span><b>{data.modeHint||"unknown"}</b></div><div className="dataRow"><span>Destination</span><b>{data.destination||"Not specified"}</b></div>{data.vehicle&&<><div className="dataRow"><span>Plate / body number</span><b>{data.vehicle.plate||"Not provided"}</b></div><div className="dataRow"><span>Operator description</span><b>{data.vehicle.operator||"Not provided"}</b></div></>}<p className="sideNote">Automatically inferred movement does not identify the public transportation type. Details are supplied by the traveler and unverified.</p><p className="helper">Expires by {new Date(data.expiresAt).toLocaleString("en-PH",{timeZone:"Asia/Manila"})}. The traveler can revoke this link at any time.</p></aside></div></>}
 <p className="helper">Please do not forward this private location link. If you need emergency help, use official emergency channels; DALAN does not dispatch responders.</p></main>;
}
