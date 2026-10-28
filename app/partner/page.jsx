"use client";
import {useState} from "react";
import Link from "next/link";
export default function PartnersPage(){
 const [form,setForm]=useState({organization:"",email:"",mode:"tricycle",route:"",bodyNumber:"",consent:false,website:""});
 const [result,setResult]=useState(""),[busy,setBusy]=useState(false);
 const edit=(key,value)=>setForm(f=>({...f,[key]:value}));
 async function submit(e){e.preventDefault();setBusy(true);setResult("");
 try{const r=await fetch("/api/partners/applications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const j=await r.json();if(!r.ok)throw Error(j.error||"Unavailable");setResult(j.notice);setForm(f=>({...f,organization:"",email:"",route:"",bodyNumber:"",consent:false}));}
 catch(e){setResult(e.message)}finally{setBusy(false)}}
 return <main className="partnerPage"><header className="sharedTop"><Link className="brandLink" href="/"><span className="brandIcon">D</span><span>DALAN<small>PARTNERS</small></span></Link><span className="tinyTag">Operator onboarding pilot</span></header>
 <section className="partnerIntro"><span className="eyebrow">DRIVERS & TRANSPORT OPERATORS</span><h1>Partner with DALAN</h1><p>Register your interest in validated route information and transport coordination. This does not create a driver account, validate your authority, or allow vehicle tracking.</p></section>
 <form className="partnerForm" onSubmit={submit}>
 <label>Registered association or operator name<input required minLength={3} maxLength={130} value={form.organization} onChange={e=>edit("organization",e.target.value)} placeholder="Transport organization or operator"/></label>
 <label>Authorized contact email<input required type="email" maxLength={180} value={form.email} onChange={e=>edit("email",e.target.value)} placeholder="contact@example.com"/></label>
 <label>Transport mode<select value={form.mode} onChange={e=>edit("mode",e.target.value)}>{["tricycle","jeepney","bus","van","other"].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
 <label>Route or service description (optional)<textarea rows={3} maxLength={320} value={form.route} onChange={e=>edit("route",e.target.value)} placeholder="Typical service corridor"/></label>
 <label>Body or unit number (optional)<input maxLength={40} value={form.bodyNumber} onChange={e=>edit("bodyNumber",e.target.value)}/></label>
 <input className="honeypot" aria-hidden="true" tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>edit("website",e.target.value)}/>
 <label className="checkRow"><input type="checkbox" checked={form.consent} onChange={e=>edit("consent",e.target.checked)}/>I am authorized to submit this information. DALAN may store and review the contact data for operator onboarding, subject to its pilot privacy notice. No public listing or vehicle verification will occur automatically.</label>
 <button className="mainButton" disabled={!form.consent||busy}>{busy?"Submitting…":"Apply for pilot review"}</button>{result&&<p role="status" className="liveStatus">{result}</p>}
 <p className="helper"><Link href="/privacy">Privacy and consent details</Link> · <Link href="/">Return to commuter app</Link></p></form></main>;
}
