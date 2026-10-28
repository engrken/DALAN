"use client";
import {useState} from "react";
export default function Page(){
 const [origin,setOrigin]=useState("Filamer Christian University");
 const [destination,setDestination]=useState("Roxas City Integrated Transport Terminal");
 const [passenger,setPassenger]=useState("Student");
 const [submitted,setSubmitted]=useState(false);
 return <main className="wrap">
  <header><div className="brand"><span className="mark">D</span><div><b>DALAN</b><small>Digital Assistance for Local Access and Navigation</small></div></div><span className="pill">Development preview</span></header>
  <section className="hero">
   <div><span className="eyebrow">Roxas City, Capiz · Initial pilot</span><h1>Every journey starts with <em>a better route.</em></h1><p>A local-first mobility platform designed for students, everyday commuters, and transport partners.</p><div className="chips"><span>Local route discovery</span><span>Transparent fares</span><span>Community alerts</span></div></div>
   <div className="planner"><div className="cardhead"><div><span className="eyebrow">COMMUTE PLANNER</span><h2>Plan your trip</h2></div><span className="demo">Demo only</span></div>
    <label htmlFor="from">From</label><input id="from" value={origin} onChange={e=>{setOrigin(e.target.value);setSubmitted(false)}}/>
    <label htmlFor="to">To</label><input id="to" value={destination} onChange={e=>{setDestination(e.target.value);setSubmitted(false)}}/>
    <label htmlFor="who">Passenger</label><select id="who" value={passenger} onChange={e=>{setPassenger(e.target.value);setSubmitted(false)}}><option>Student</option><option>Regular</option><option>Senior citizen</option><option>PWD</option></select>
    <button disabled={!origin.trim()||!destination.trim()} onClick={()=>setSubmitted(true)}>Explore sample request <span>→</span></button>
    {submitted&&<p className="notice" role="status"><strong>Demo request accepted.</strong> This preview has no validated routes, fares, travel times, or live transport information. Do not use it to plan an actual journey.</p>}
    <small className="privacy">No trip data is submitted or saved in this prototype.</small>
   </div>
  </section>
  <section className="intro"><span className="eyebrow">BUILT FOR THE COMMUNITY</span><h2>Smarter mobility starts with trusted information.</h2><p>DALAN will distinguish verified transport data, modeled estimates, and unverified commuter reports before offering public travel guidance.</p></section>
  <div className="cards"><article><span>⌖</span><h3>Verified routes</h3><p>Locally confirmed stops, route options, and transfer points.</p><small>Coming later</small></article><article><span>₱</span><h3>Fare clarity</h3><p>Published fare schedules with supported commuter discounts.</p><small>Coming later</small></article><article><span>◎</span><h3>Trip awareness</h3><p>Moderated service advisories and validated road conditions.</p><small>Coming later</small></article></div>
  <footer><strong>DALAN · v0.1</strong>Development preview · Not for navigation or emergency use</footer>
 </main>
}
