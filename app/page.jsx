"use client";
import {useState} from "react";
export default function Page(){
 const [origin,setOrigin]=useState("Filamer Christian University");
 const [destination,setDestination]=useState("Roxas City Integrated Transport Terminal");
 const [passenger,setPassenger]=useState("Student");
 const [submitted,setSubmitted]=useState(false);
 return <main className="wrap">
  <header><div className="brand"><span className="mark">R</span><div><b>RoxasGo</b><small>Roxas City commuter guide</small></div></div><span className="pill">Development preview</span></header>
  <section className="hero">
   <div><span className="eyebrow">Roxas City, Capiz · Initial pilot</span><h1>Your city. Your route. <em>Your ride.</em></h1><p>A commuter-first guide for finding local transport options across Roxas City, Capiz. Explore tricycle and jeepney routes, fare guidance, and community updates as verified information becomes available.</p><div className="chips"><span>Local route discovery</span><span>Transparent fares</span><span>Community alerts</span></div></div>
   <div className="planner"><div className="cardhead"><div><span className="eyebrow">COMMUTE PLANNER</span><h2>Plan your trip</h2></div><span className="demo">Demo only</span></div>
    <label htmlFor="from">From</label><input id="from" value={origin} onChange={e=>{setOrigin(e.target.value);setSubmitted(false)}}/>
    <label htmlFor="to">To</label><input id="to" value={destination} onChange={e=>{setDestination(e.target.value);setSubmitted(false)}}/>
    <label htmlFor="who">Passenger</label><select id="who" value={passenger} onChange={e=>{setPassenger(e.target.value);setSubmitted(false)}}><option>Student</option><option>Regular</option><option>Senior citizen</option><option>PWD</option></select>
    <button disabled={!origin.trim()||!destination.trim()} onClick={()=>setSubmitted(true)}>Explore sample request <span>→</span></button>
    {submitted&&<p className="notice" role="status"><strong>Demo request accepted.</strong> This preview has no validated routes, fares, travel times, or live transport information. Do not use it to plan an actual journey.</p>}
    <small className="privacy">No trip data is submitted or saved in this prototype.</small>
   </div>
  </section>
  <section className="intro"><span className="eyebrow">BUILT FOR THE COMMUNITY</span><h2>Commuting starts with trusted local information.</h2><p>RoxasGo is being built for daily commuters, students, senior citizens, and PWD passengers. Verified routes and official fares will be clearly distinguished from estimates and unverified commuter reports.</p></section>
  <div className="cards"><article><span>⌖</span><h3>Tricycle and jeepney routes</h3><p>Locally confirmed routes, stops, boarding points, and transfers.</p><small>Coming later</small></article><article><span>₱</span><h3>Commuter fare guide</h3><p>Official fare schedules with student, senior citizen, and PWD discounts where applicable.</p><small>Coming later</small></article><article><span>◎</span><h3>Commuter assistance</h3><p>Community reports, optional trip sharing, and validated service advisories.</p><small>Coming later</small></article></div>
  <footer><strong>RoxasGo · v0.1</strong>Development preview · Not for navigation or emergency use</footer>
 </main>
}
