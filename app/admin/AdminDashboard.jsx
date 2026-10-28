"use client";
import { useState } from "react";
import Link from "next/link";

const labels={road:"Road condition",fare:"Fare concern",transport:"Transport availability",accessibility:"Accessibility",other:"Other"};
export default function AdminDashboard({initialReports,initialCounts,error}) {
  const [reports,setReports]=useState(initialReports);
  const [filter,setFilter]=useState("all");
  const [busy,setBusy]=useState("");
  const [message,setMessage]=useState(error||"");
  const [counts,setCounts]=useState({pending:initialCounts.pending||0,reviewed:initialCounts.reviewed||0,dismissed:initialCounts.dismissed||0});
  const view=reports.filter(r=>filter==="all"||r.status===filter);
  async function changeStatus(id,status) {
    setBusy(id);setMessage("");
    try { const res=await fetch("/api/admin/reports",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});const json=await res.json();if(!res.ok)throw new Error(json.error||"Update failed");setReports(old=>old.map(r=>r.id===id?{...r,status}:r));setMessage("Report updated successfully.");}
    catch(e){setMessage(e.message||"Unable to update report");}finally{setBusy("");}
  }
  async function logout() {
    try{await fetch("/api/admin/session",{method:"DELETE"});}finally{window.location.href="/admin/login";}
  }
  return <main className="adminMain">
   <div className="adminTitle"><div><span className="eyebrow">OPERATIONS CENTER</span><h1>Commuter reports</h1><p>Only submitted pilot reports appear here. Reports are not published as verified transportation advisories.</p></div><div className="adminActions"><Link className="btnSecondary" href="/">View commuter app</Link><button onClick={logout} className="btnSecondary">Sign out</button></div></div>
   <div className="statGrid"><div className="stat"><span>Awaiting review</span><b>{counts.pending}</b><small>Needs administrative attention</small></div><div className="stat"><span>Reviewed</span><b>{counts.reviewed}</b><small>Reviewed is not official confirmation</small></div><div className="stat"><span>Dismissed</span><b>{counts.dismissed}</b><small>Flagged unsuitable / duplicates</small></div><div className="stat"><span>Recent submissions</span><b>{reports.length}{reports.length===75?"+":""}</b><small>Most recent 75 records</small></div></div>
   <section className="adminPanel"><div className="tableHeading"><div><h2>Incoming reports</h2><p>No personally identifying information is requested by this pilot form.</p></div><label className="filter">Status <select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All</option><option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="dismissed">Dismissed</option></select></label></div>
   {message&&<div role="status" className="adminNotice">{message}</div>}
   {!view.length?<div className="empty">No reports match this status yet.</div>:<div className="reportList">{view.map(r=><article key={r.id} className="reportCard"><div className="reportTop"><span className="tag tagBlue">{labels[r.category]||"Other"}</span><span className={"tag "+(r.status==="pending"?"tagGold":"tagGreen")}>{r.status}</span></div><h3>{r.area}</h3><p>{r.details}</p><div className="reportMeta"><span>Submitted: {new Date(r.created_at).toLocaleString("en-PH",{timeZone:"Asia/Manila"})}</span>{r.approx_lat!=null&&<span>Approx. cell: {r.approx_lat}, {r.approx_lng}</span>}</div><div className="reportActions"><button disabled={busy===r.id||r.status==="reviewed"} onClick={()=>changeStatus(r.id,"reviewed")}>Mark reviewed</button><button disabled={busy===r.id||r.status==="dismissed"} onClick={()=>changeStatus(r.id,"dismissed")}>Dismiss</button>{r.status!=="pending"&&<button disabled={busy===r.id} onClick={()=>changeStatus(r.id,"pending")}>Reopen</button>}</div></article>)}</div>}
   </section><p className="adminFootnote">Internal pilot only. Report moderation does not verify route availability, legal fares, or road safety. Production operations will require individual staff roles and audit logs.</p>
  </main>;
}
