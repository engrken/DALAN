"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LiveTrip from "./components/LiveTrip";

const categoryNames = { road:"Road condition",fare:"Fare concern",transport:"Transport availability",accessibility:"Accessibility",other:"Other" };
const destinations = ["Filamer Christian University","Roxas City Integrated Transport Terminal","Roxas City Plaza","SM City Roxas"];
export default function Home() {
 const [section,setSection]=useState("plan");
 const [origin,setOrigin]=useState("Filamer Christian University");
 const [destination,setDestination]=useState("Roxas City Integrated Transport Terminal");
 const [passenger,setPassenger]=useState("Student");
 const [coords,setCoords]=useState(null);
 const [gpsStatus,setGpsStatus]=useState("");
 const [loadingLocation,setLoadingLocation]=useState(false);
 const [cameraStatus,setCameraStatus]=useState("");
 const [cameraEnabled,setCameraEnabled]=useState(false);
 const [installPrompt,setInstallPrompt]=useState(null);
 const [installed,setInstalled]=useState(false);
 const cameraRef=useRef(null),streamRef=useRef(null);
 const [category,setCategory]=useState("road");
 const [area,setArea]=useState("");
 const [details,setDetails]=useState("");
 const [includeApprox,setIncludeApprox]=useState(false);
 const [confirm,setConfirm]=useState(false);
 const [website,setWebsite]=useState("");
 const [submitting,setSubmitting]=useState(false);
 const [reportResult,setReportResult]=useState(null);
 const [stats,setStats]=useState(null);
 useEffect(()=>{
  if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
  const capture=(e)=>{e.preventDefault();setInstallPrompt(e);};
  const installedFn=()=>{setInstalled(true);setInstallPrompt(null);};
  window.addEventListener("beforeinstallprompt",capture);
  window.addEventListener("appinstalled",installedFn);
  fetch("/api/reports",{cache:"no-store"}).then(r=>r.json()).then(setStats).catch(()=>{});
  return ()=>{window.removeEventListener("beforeinstallprompt",capture);window.removeEventListener("appinstalled",installedFn);};
 },[]);
 useEffect(()=>{
  function stopPrivatePreview(){
   streamRef.current?.getTracks().forEach(t=>t.stop());
   streamRef.current=null;
   setCameraEnabled(false);
  }
  const hide=()=>{if(document.hidden) stopPrivatePreview();};
  document.addEventListener("visibilitychange",hide);
  window.addEventListener("pagehide",stopPrivatePreview);
  return ()=>{stopPrivatePreview();document.removeEventListener("visibilitychange",hide);window.removeEventListener("pagehide",stopPrivatePreview);};
 },[]);
 useEffect(()=>{if(section!=="tools" && streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;setCameraEnabled(false);}},[section]);
 async function getLocation(){
  if(!navigator.geolocation){setGpsStatus("This browser does not provide geolocation.");return;}
  setLoadingLocation(true);setGpsStatus("Requesting your permission...");
  navigator.geolocation.getCurrentPosition(
   p=>{setCoords({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:Math.round(p.coords.accuracy)});setGpsStatus("Location received on this device. Nothing has been uploaded.");setLoadingLocation(false);},
   err=>{setGpsStatus(err.code===1?"Location permission denied. You can still use DALAN without it.":"Unable to obtain your location. Try again with GPS enabled.");setLoadingLocation(false);},
   {enableHighAccuracy:false,timeout:12000,maximumAge:60000}
  );
 }
 function clearLocation(){setCoords(null);setIncludeApprox(false);setGpsStatus("Location cleared from this screen.");}
 function externalDirections(){
  const from=coords&&origin==="Use device location"?coords.lat+","+coords.lng:origin;
  const url="https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(from)+"&destination="+encodeURIComponent(destination);
  window.open(url,"_blank","noopener,noreferrer");
 }
 async function shareTrip(){
  const text="DALAN route inquiry: "+origin+" → "+destination+" ("+passenger+"). Route and fare are not yet verified.";
  if(navigator.share){try{await navigator.share({title:"DALAN commute plan",text,url:window.location.origin});}catch{}}
  else if(navigator.clipboard){await navigator.clipboard.writeText(text+" "+window.location.origin);setGpsStatus("Trip description copied without device coordinates.");}
  else setGpsStatus("Sharing is not supported on this browser.");
 }
 async function openCamera(){
  if(!navigator.mediaDevices?.getUserMedia){setCameraStatus("Camera preview is unsupported in this browser.");return;}
  try{
   const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
   streamRef.current=stream;setCameraEnabled(true);setCameraStatus("Camera preview active. No video is transmitted, stored, or used to verify a driver.");
   if(cameraRef.current){cameraRef.current.srcObject=stream;cameraRef.current.play().catch(()=>{});}
  }catch{setCameraStatus("Camera permission was not granted or the camera is unavailable.");}
 }
 function stopCamera(){
  streamRef.current?.getTracks().forEach(track=>track.stop());streamRef.current=null;
  if(cameraRef.current)cameraRef.current.srcObject=null;
  setCameraEnabled(false);setCameraStatus("Camera stopped.");
 }
 async function sendReport(e){
  e.preventDefault();setReportResult(null);
  if(!confirm){setReportResult({error:true,text:"Please confirm that your report contains no personal or emergency information."});return;}
  if(includeApprox&&!coords){setReportResult({error:true,text:"Request device location first, or turn off approximate location sharing."});return;}
  setSubmitting(true);
  try{
   const response=await fetch("/api/reports",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({category,area,details,website,shareApproximateLocation:includeApprox&&!!coords,lat:includeApprox?coords?.lat:undefined,lng:includeApprox?coords?.lng:undefined})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Report submission failed");
   setReportResult({error:false,text:"Submitted for admin review. Reference: "+data.reference+". This is not a verified public alert."});
   setArea("");setDetails("");setConfirm(false);setIncludeApprox(false);
  }catch(e){setReportResult({error:true,text:e.message||"Unable to submit right now."});}finally{setSubmitting(false);}
 }
 return <main className="dalanApp">
   <header className="topbar"><div className="topBrand"><span className="brandIcon">D</span><span><b>DALAN</b><small>Smarter journeys, locally.</small></span></div><div className="topRight"><span className="pilotPill">Pilot · Roxas City</span><Link href="/partner" className="adminLink">Partners</Link><Link href="/admin" className="adminLink">Control</Link></div></header>
   <section className="welcome"><span className="eyebrow">DIGITAL ASSISTANCE FOR LOCAL ACCESS AND NAVIGATION</span><h1>Move through the city <em>with confidence.</em></h1><p>An early mobility pilot for students and commuters. Local route and fare verification is still in progress.</p><div className="statusPill">● Development only — no verified live transit routes or fare prices</div></section>
   <nav aria-label="Commuter features" className="tabs"><button className={section==="plan"?"tab active":"tab"} onClick={()=>setSection("plan")}>⌖ <span>Trip planner</span></button><button className={section==="map"?"tab active":"tab"} onClick={()=>setSection("map")}>◉ <span>Map & live trip</span></button><button className={section==="report"?"tab active":"tab"} onClick={()=>setSection("report")}>▤ <span>Report issue</span></button><button className={section==="tools"?"tab active":"tab"} onClick={()=>setSection("tools")}>◇ <span>Device tools</span></button></nav>
   {section==="plan"&&<div className="contentGrid"><section className="primaryPanel"><div className="panelHead"><div><span className="eyebrow">YOUR COMMUTE</span><h2>Where are you headed?</h2></div><span className="tinyTag">Planning mode</span></div><label htmlFor="start">Starting point</label><div className="inputGroup"><span>○</span><input id="start" list="dalan-places" value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="Choose origin"/></div><label htmlFor="end">Destination</label><div className="inputGroup"><span>⌖</span><input id="end" list="dalan-places" value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Choose destination"/></div><datalist id="dalan-places">{destinations.map(x=><option key={x} value={x}/>)}</datalist><label htmlFor="passenger">Passenger type</label><select id="passenger" className="fullInput" value={passenger} onChange={e=>setPassenger(e.target.value)}><option>Student</option><option>Regular</option><option>Senior Citizen</option><option>Person with Disability</option></select><div className="buttonGrid"><button className="mainButton" disabled={!origin.trim()||!destination.trim()} onClick={externalDirections}>Open external directions ↗</button><button className="outlineButton" onClick={shareTrip}>Share trip</button></div><p className="finePrint">External directions are provided by Google Maps, not DALAN. Actual transport service, fare, and travel time have not been independently verified. Selecting external directions sends the entered locations to Google.</p></section>
    <aside className="sidePanel"><span className="eyebrow">LIVE DATA STATUS</span><h2>Built on trustworthy information.</h2><div className="dataRow"><span>Route verification</span><b className="warnText">Pending</b></div><div className="dataRow"><span>Fare matrix</span><b className="warnText">Pending</b></div><div className="dataRow"><span>Live vehicle tracking</span><b>Not enabled</b></div><div className="dataRow"><span>Reviewed pilot reports</span><b>{stats?.reviewedReports??"—"}</b></div><p className="sideNote">No imaginary boarding points, ETAs, or student discounts are presented as official.</p></aside></div>}
   {section==="map"&&<LiveTrip destination={destination}/>}
   {section==="report"&&<div className="contentGrid"><section className="primaryPanel"><div className="panelHead"><div><span className="eyebrow">COMMUNITY ASSISTANCE</span><h2>Report a commute issue</h2></div><span className="tinyTag">Moderated</span></div><p className="helper">Submissions go to DALAN Control for review. Not an emergency reporting system. Do not include names, license plates, phone numbers, student IDs, or medical details.</p><form onSubmit={sendReport}><label htmlFor="issue">Report type</label><select id="issue" className="fullInput" value={category} onChange={e=>setCategory(e.target.value)}>{Object.entries(categoryNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select><label htmlFor="area">General area or landmark</label><input id="area" className="fullInput" value={area} onChange={e=>setArea(e.target.value)} minLength={2} maxLength={100} required placeholder="e.g. Roxas City Plaza"/><label htmlFor="details">What happened?</label><textarea id="details" value={details} onChange={e=>setDetails(e.target.value)} minLength={10} maxLength={500} rows={5} required placeholder="Briefly describe the commuting issue without personal information"/><small className="chars">{details.length}/500 characters</small><div className="honeypot"><label htmlFor="website">Website</label><input id="website" value={website} onChange={e=>setWebsite(e.target.value)} autoComplete="off" tabIndex={-1}/></div><label className="checkRow"><input type="checkbox" checked={includeApprox} onChange={e=>setIncludeApprox(e.target.checked)}/><span>Include an approximate location (rounded to ~0.01°) if I have enabled GPS. This is optional.</span></label>{includeApprox&&!coords&&<div className="softNotice">Turn on device location in Device tools, or uncheck approximate location.</div>}<label className="checkRow"><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)}/><span>I understand this goes to DALAN administration for review, and I have removed personal information.</span></label><button className="mainButton" disabled={submitting||!confirm}>{submitting?"Sending report…":"Submit report for review"}</button></form>{reportResult&&<p className={reportResult.error?"result error":"result"} role="status">{reportResult.text}</p>}</section><aside className="sidePanel"><span className="eyebrow">YOUR PRIVACY</span><h2>Only share what you choose.</h2><p className="helper">DALAN does not require an account to send a pilot report. Device GPS is optional and never accessed automatically. If you consent to include your approximate coordinates, DALAN rounds them on the server before storing them.</p><p className="helper">Your report is not automatically published or treated as a confirmed traffic advisory.</p></aside></div>}
   {section==="tools"&&<div className="contentGrid"><section className="primaryPanel"><div className="panelHead"><div><span className="eyebrow">DEVICE PERMISSIONS</span><h2>Smartphone tools</h2></div><span className="tinyTag">Opt-in only</span></div><div className="toolItem"><div><h3>⌖ Device location</h3><p>Ask your phone for its location when you tap the button. Coordinates stay in browser memory unless you separately choose to submit an approximate location with a report.</p></div><div className="toolButtons"><button className="outlineButton" onClick={getLocation} disabled={loadingLocation}>{loadingLocation?"Requesting…":coords?"Refresh location":"Allow location"}</button>{coords&&<button className="textButton" onClick={clearLocation}>Clear location</button>}</div>{coords&&<div className="coordinateInfo"><b>GPS available on device</b><span>Accuracy reported: ±{coords.accuracy} m</span><span>Position: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} — not uploaded</span><button onClick={()=>{setOrigin("Use device location");setSection("plan")}} className="textButton">Use as starting point ↗</button></div>}{gpsStatus&&<p className="helper" role="status">{gpsStatus}</p>}</div><div className="toolItem"><div><h3>▣ Camera access</h3><p>Test an optional rear-camera preview. No pictures or video are recorded, scanned, uploaded, or saved in this pilot.</p></div><video className={cameraEnabled?"cameraPreview":"cameraPreview hidden"} ref={cameraRef} playsInline muted autoPlay/>{cameraEnabled?<button className="outlineButton" onClick={stopCamera}>Stop camera</button>:<button className="outlineButton" onClick={openCamera}>Allow camera preview</button>}{cameraStatus&&<p className="helper" role="status">{cameraStatus}</p>}</div></section><aside className="sidePanel"><span className="eyebrow">INSTALL DALAN</span><h2>Add to your home screen</h2><p className="helper">DALAN can be added to compatible smartphone home screens as a web application. An internet connection is required for routes, reports and admin services.</p>{installPrompt?<button className="mainButton" onClick={async()=>{await installPrompt.prompt();setInstallPrompt(null)}}>Install DALAN</button>:<div className="softNotice">{installed?"DALAN is installed on this device.":"Use your mobile browser menu and select Add to Home Screen or Install App, if available."}</div>}<div className="dataRow"><span>Camera & GPS</span><b>Ask only</b></div><div className="dataRow"><span>Background location</span><b>Disabled</b></div><div className="dataRow"><span>Push notifications</span><b>Not enabled</b></div></aside></div>}
   <section className="featureStrip"><div><span>01</span><h3>Local-first</h3><p>Roxas City pilot, expandable to other cities.</p></div><div><span>02</span><h3>Transparent</h3><p>Unverified routes and fares labeled clearly.</p></div><div><span>03</span><h3>Permission-based</h3><p>Device features never activate without action.</p></div></section>
   <footer className="footer"><span><strong>DALAN</strong> · Digital Assistance for Local Access and Navigation</span><span>Private pilot v0.6 · Not for emergency or live navigation</span><span><Link href="/privacy">Privacy & permissions</Link> · <Link href="/admin">Administration ↗</Link></span></footer>
  </main>;
}
