"use client";
import {useEffect,useRef,useState} from "react";
import DalanMap from "./DalanMap";

function speedLabel(kph,accuracy){
 if(accuracy==null||accuracy>65||kph==null)return {hint:"unknown",text:"Insufficient GPS accuracy for motion inference"};
 if(kph<2)return {hint:"unknown",text:"Stationary or moving slowly"};
 if(kph<9)return {hint:"walking",text:"Movement suggests walking (unverified)"};
 if(kph<17)return {hint:"unknown",text:"Movement type unclear; confirm vehicle yourself"};
 return {hint:"motorized",text:"Movement suggests motorized travel (vehicle type unverified)"};
}
const types=["unknown","tricycle","jeepney","bus","van","car","motorcycle","walking","other"];
export default function LiveTrip({destination}){
 const [location,setLocation]=useState(null),[status,setStatus]=useState("Location is off until you grant permission.");
 const [vehicleType,setVehicleType]=useState("unknown"),[plate,setPlate]=useState(""),[operator,setOperator]=useState("");
 const [shareVehicle,setShareVehicle]=useState(false),[agreed,setAgreed]=useState(false);
 const [adminMonitoring,setAdminMonitoring]=useState(false),[assistanceNote,setAssistanceNote]=useState(""),[assistance,setAssistance]=useState("none"),[nextCheckin,setNextCheckin]=useState(null),[safetyMessage,setSafetyMessage]=useState("");
 const [session,setSession]=useState(null),[busy,setBusy]=useState(false),[paused,setPaused]=useState(false),[motion,setMotion]=useState({hint:"unknown",text:"Movement not measured"});
 const [shareNote,setShareNote]=useState("");
 const watchRef=useRef(null),sessionRef=useRef(null),lastSendRef=useRef(0),prevRef=useRef(null),sendingRef=useRef(false);
 const latestLocationRef=useRef(null);
 useEffect(()=>{sessionRef.current=session;},[session]);
 useEffect(()=>{
  try{
   const raw=sessionStorage.getItem("dalan_active_trip_owner");
   if(!raw)return;
   const saved=JSON.parse(raw);
   if(saved&&/^[0-9a-f]{64}$/.test(saved.viewerToken||"")&&/^[0-9a-f]{64}$/.test(saved.ownerToken||"")&&Date.now()<new Date(saved.expiresAt).getTime()){
    sessionRef.current=saved;setSession(saved);setPaused(true);
    setStatus("A shared link is still active from this tab. GPS updates are paused. Tap Resume or Stop & revoke.");
   }else sessionStorage.removeItem("dalan_active_trip_owner");
  }catch{sessionStorage.removeItem("dalan_active_trip_owner");}
 },[]);
 useEffect(()=>{
  function hide(){if(document.hidden&&watchRef.current!==null){navigator.geolocation.clearWatch(watchRef.current);watchRef.current=null;if(sessionRef.current){setPaused(true);setStatus("Location updates paused while DALAN is in the background. Open DALAN and tap Resume to continue.");}}}
  document.addEventListener("visibilitychange",hide);
  return()=>{document.removeEventListener("visibilitychange",hide);if(watchRef.current!==null)navigator.geolocation.clearWatch(watchRef.current);};
 },[]);
 function applyFix(p){
  const loc={lat:p.coords.latitude,lng:p.coords.longitude,accuracy:Math.round(p.coords.accuracy),capturedAt:p.timestamp};
  latestLocationRef.current=loc;
  setLocation(loc);
  let kph=p.coords.speed!=null&&p.coords.speed>=0?p.coords.speed*3.6:null;
  const prev=prevRef.current;
  if(kph==null&&prev&&loc.accuracy<=50&&prev.accuracy<=50){
   const seconds=(loc.capturedAt-prev.capturedAt)/1000;
   if(seconds>=7&&seconds<=120){
    const rad=Math.PI/180,dlat=(loc.lat-prev.lat)*rad,dlng=(loc.lng-prev.lng)*rad;
    const a=Math.sin(dlat/2)**2+Math.cos(prev.lat*rad)*Math.cos(loc.lat*rad)*Math.sin(dlng/2)**2;
    const metres=6371000*2*Math.asin(Math.min(1,Math.sqrt(a)));
    if(metres>Math.max(loc.accuracy,prev.accuracy))kph=metres/seconds*3.6;
   }
  }
  prevRef.current=loc;
  const detected=speedLabel(kph,loc.accuracy);
  setMotion({...detected,kph:kph==null?null:Math.round(kph)});
  setStatus("GPS enabled with your permission. Accuracy approximately ±"+loc.accuracy+" metres.");
  const active=sessionRef.current;
  if(active&&Date.now()-lastSendRef.current>12000&&!sendingRef.current&&loc.accuracy<=150){
    lastSendRef.current=Date.now();sendingRef.current=true;
    fetch("/api/trips/"+active.viewerToken,{method:"PATCH",headers:{"Content-Type":"application/json","X-Dalan-Owner-Token":active.ownerToken},body:JSON.stringify({...loc,speedKph:kph==null?null:Math.min(300,Math.max(0,kph)),modeHint:detected.hint})})
     .then(r=>{if(!r.ok&&r.status!==409)setStatus("GPS received, but latest update could not be sent. Confirm internet connectivity.");})
     .catch(()=>setStatus("Offline or unable to upload latest GPS fix. Family will see a stale location."))
     .finally(()=>{sendingRef.current=false;});
  }
 }
 function locateOnce(){
  if(!navigator.geolocation){setStatus("Your device does not support GPS in this browser.");return;}
  setBusy(true);
  navigator.geolocation.getCurrentPosition(p=>{applyFix(p);setBusy(false);},e=>{setStatus(e.code===1?"Location permission denied. Nothing is being tracked.":"Unable to read device location; try again outdoors.");setBusy(false);},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
 }
 function beginWatch(){
  if(!navigator.geolocation)return;
  if(watchRef.current!==null)navigator.geolocation.clearWatch(watchRef.current);
  watchRef.current=navigator.geolocation.watchPosition(applyFix,e=>{setStatus(e.code===1?"Location permission revoked. Live updates have stopped.":"GPS update unavailable; viewers will see the last timestamp.");if(e.code===1){navigator.geolocation.clearWatch(watchRef.current);watchRef.current=null;setPaused(true);}}, {enableHighAccuracy:true,maximumAge:0,timeout:20000});
  setPaused(false);
 }
 async function start(){
  if(!agreed){setStatus("Read and accept the sharing notice first.");return;}
  if(!location||Date.now()-location.capturedAt>30000){setStatus("Tap Refresh GPS immediately before starting a live share.");return;}
  if(location.accuracy>150){setStatus("GPS accuracy is too low for sharing. Move to an open area and refresh.");return;}
  setBusy(true);
  try{
   const res=await fetch("/api/trips",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({consent:true,...location,vehicleType,plate,operator,shareVehicleDetails:shareVehicle,adminMonitoring,adminConsent:adminMonitoring,destination})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Could not start sharing");
   const active={viewerToken:data.viewerToken,ownerToken:data.ownerToken,expiresAt:data.expiresAt};
   sessionRef.current=active;setSession(active);sessionStorage.setItem("dalan_active_trip_owner",JSON.stringify(active));
   setStatus("Live sharing is enabled for 60 minutes at most. Keep DALAN open for updates.");setNextCheckin(Date.now()+15*60*1000);
   beginWatch();
  }catch(e){setStatus(e.message||"Cannot start trip");}finally{setBusy(false);}
 }
 async function stop(){
  const active=sessionRef.current;
  if(watchRef.current!==null){navigator.geolocation.clearWatch(watchRef.current);watchRef.current=null;}
  setPaused(false);
  if(active){
   setBusy(true);
   try{
    const res=await fetch("/api/trips/"+active.viewerToken,{method:"DELETE",headers:{"X-Dalan-Owner-Token":active.ownerToken}});
    if(!res.ok)throw new Error("Unable to revoke this trip. Try again while online. The link also expires automatically.");
    sessionStorage.removeItem("dalan_active_trip_owner");sessionRef.current=null;setSession(null);setShareNote("");setAssistance("none");setNextCheckin(null);setAdminMonitoring(false);setStatus("Trip sharing stopped and its location record deleted.");
   }catch(e){setStatus(e.message);setPaused(true);}
   finally{setBusy(false);}
  }
 }
 async function safetyAction(action){
  const active=sessionRef.current;if(!active)return;
  setBusy(true);setSafetyMessage("");
  try{
   const res=await fetch("/api/trips/"+active.viewerToken+"/safety",{method:"POST",headers:{"Content-Type":"application/json","X-Dalan-Owner-Token":active.ownerToken},body:JSON.stringify({action,confirm:true,note:assistanceNote})});
   const data=await res.json();if(!res.ok)throw Error(data.error||"Unable to update safety preferences");
   if(action==="check_in")setNextCheckin(Date.now()+15*60*1000);
   if(action==="grant_admin")setAdminMonitoring(true);
   if(action==="revoke_admin")setAdminMonitoring(false);
   if(action==="request_assistance"){setAssistance("requested");setAdminMonitoring(true);}
   if(action==="cancel_assistance"){setAssistance("none");setAdminMonitoring(false);}
   setSafetyMessage(data.notice||"Safety preference updated.");
  }catch(e){setSafetyMessage(e.message);}finally{setBusy(false);}
 }
  async function shareLink(){
  if(!session)return;
  const url=window.location.origin+"/share/"+session.viewerToken;
  try{
   if(navigator.share)await navigator.share({title:"DALAN live trip location",text:"I chose to share my current DALAN trip. The link expires within one hour. Please don't forward it.",url});
   else if(navigator.clipboard){await navigator.clipboard.writeText(url);setShareNote("Link copied. Send only to trusted friends or family.");}
   else setShareNote("Link: "+url);
  }catch{}
 }
 return <div className="liveGrid">
  <section className="liveMain">
   <div className="liveHeading"><div><span className="eyebrow">MAP & OPTIONAL LIVE LOCATION</span><h2>Your location on the map</h2></div><span className="tinyTag">Opt-in</span></div>
   <DalanMap position={location} />
   <div className="liveControls"><button className="outlineButton" onClick={locateOnce} disabled={busy}>{location?"Refresh GPS":"Allow location"}</button>{location&&<span className="locationInfo">Accuracy: ±{location.accuracy} m</span>}</div>
   <div className="liveStatus" role="status">{status}</div>
   <div className="motionNotice"><b>Suggested movement:</b> {motion.text}{motion.kph!=null&&<span> · ~{motion.kph} km/h</span>}<p>GPS cannot determine whether a vehicle is a tricycle, jeepney, van, or bus. Confirm the transport type manually.</p></div>
   <h3>Trip vehicle information (optional)</h3>
   <div className="vehicleFields">
    <label>Transportation type<select value={vehicleType} onChange={e=>setVehicleType(e.target.value)} disabled={!!session}>{types.map(x=><option key={x} value={x}>{x==="unknown"?"Not specified":x.charAt(0).toUpperCase()+x.slice(1)}</option>)}</select></label>
    <label>Plate / body number<input value={plate} onChange={e=>setPlate(e.target.value.toUpperCase())} maxLength={20} placeholder="Optional e.g. BODY 123" disabled={!!session}/></label>
    <label className="fieldWide">Driver/operator or service description<input value={operator} onChange={e=>setOperator(e.target.value)} maxLength={80} placeholder="Optional; avoid personal contact information" disabled={!!session}/></label>
   </div>
   <p className="helper">Entered vehicle details are not verified against official registration data. Do not use this to identify or accuse a driver. Only provide information you have a legitimate reason to share.</p>
   {!session&&<div className="shareConsent">
    <label className="checkRow"><input type="checkbox" checked={shareVehicle} onChange={e=>setShareVehicle(e.target.checked)}/><span>Include the above vehicle information in the recipient's trip-view page (otherwise hidden).</span></label>
    <label className="checkRow"><input type="checkbox" checked={adminMonitoring} onChange={e=>setAdminMonitoring(e.target.checked)}/><span><b>Separately authorize DALAN safety officers to view my GPS during this trip.</b> Only named staff with the safety role should have access, and every precise-location lookup is logged. This is optional and can be revoked; an active assistance request must first be cancelled.</span></label>
    <label className="checkRow"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/><span><b>I explicitly choose to share my live GPS location.</b> Anyone who receives my link may see my current coordinates and timestamp for up to 60 minutes. Updates only work while this screen is open, unpaused and the internet is available. If you navigate away, return to this screen to resume or revoke; after the browser tab closes, automatic revocation is not guaranteed. The link is revocable. Sharing does not alert emergency services.</span></label>
    <button className="mainButton" onClick={start} disabled={!agreed||busy||!location}>Start private trip share</button>
   </div>}
   {session&&<div className="activeShare">
    <span className="sharingBadge">● LIVE LINK ENABLED</span>
    <p>Expires: {new Date(session.expiresAt).toLocaleString("en-PH",{timeZone:"Asia/Manila"})} (Philippine time)</p>
    <div className="liveControls"><button className="mainButton" onClick={shareLink}>Share link with family / friend</button><button className="outlineButton" onClick={stop} disabled={busy}>Stop & revoke link</button>{paused&&<button className="outlineButton" onClick={beginWatch}>Resume GPS updates</button>}</div>
    <section className="safetyActions"><h3>Trip safety check-ins</h3><p>Check in about every 15 minutes while the app stays open. A missed check-in is not proof of danger and does not automatically call responders.</p><p className={nextCheckin&&Date.now()>nextCheckin?"checkinOverdue":"checkinDue"}>{nextCheckin?"Next check-in by "+new Date(nextCheckin).toLocaleTimeString("en-PH",{timeZone:"Asia/Manila"}):"Check-in not scheduled"}</p><button className="outlineButton" disabled={busy} onClick={()=>safetyAction("check_in")}>I'm okay — check in</button>
      <h3>DALAN safety assistance (pilot)</h3><p>Submit an internal assistance request and share your current trip with authorized safety staff. <b>This is not an emergency dispatch service and does not guarantee a response.</b> If you are in immediate danger, contact official emergency services.</p><label className="controlField">Optional assistance note<textarea rows={2} maxLength={300} value={assistanceNote} onChange={e=>setAssistanceNote(e.target.value)} placeholder="General situation without unnecessary personal information"/></label>
      {assistance==="none"?<button className="mainButton" disabled={busy} onClick={()=>safetyAction("request_assistance")}>Request DALAN assistance</button>:<button className="outlineButton" disabled={busy} onClick={()=>safetyAction("cancel_assistance")}>Cancel assistance & revoke staff access</button>}
      <h3>Administrator visibility</h3><p>{adminMonitoring?"Authorized safety officers may view this trip's latest GPS with access logging.":"Administrators cannot see this trip's precise location."}</p><div className="liveControls">{adminMonitoring&&assistance==="none"?<button className="outlineButton" disabled={busy} onClick={()=>safetyAction("revoke_admin")}>Revoke admin GPS access</button>:!adminMonitoring?<button className="outlineButton" disabled={busy} onClick={()=>safetyAction("grant_admin")}>Allow safety-officer monitoring</button>:null}</div>
      {safetyMessage&&<p className="liveStatus" role="status">{safetyMessage}</p>}
     </section>
     {shareNote&&<p className="helper" role="status">{shareNote}</p>}
    <p className="helper">The viewer link is a secret. For now, Vercel Authentication also limits access to authorized DALAN testers; public family viewing will be enabled only after privacy and security review.</p>
   </div>}
  </section>
  <aside className="liveAside"><span className="eyebrow">SAFETY & PRIVACY</span><h2>You control location sharing.</h2>
   <div className="dataRow"><span>Location permission</span><b>{location?"Granted in app":"Not in use"}</b></div>
   <div className="dataRow"><span>Share session</span><b>{session?"Active / time-limited":"Off"}</b></div>
   <div className="dataRow"><span>Location history</span><b>Not stored</b></div>
   <div className="dataRow"><span>Background tracking</span><b>Not supported</b></div>
   <p className="sideNote">A stale GPS position is never evidence of someone's present location. If you are in danger, contact local emergency services directly.</p>
  </aside>
 </div>;
}
