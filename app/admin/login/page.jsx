"use client";
import {useState} from "react";
import Link from "next/link";
export default function AdminLogin() {
 const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function submit(e) {
  e.preventDefault();setBusy(true);setError("");
  try { const res=await fetch("/api/admin/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});const json=await res.json();if(!res.ok)throw new Error(json.error||"Login failed");window.location.assign("/admin");}
  catch(e){setError(e.message||"Login unsuccessful");setBusy(false);}
 }
 return <main className="loginWrap"><section className="loginBox"><div className="loginBrand"><span className="brandIcon">D</span><strong>DALAN Control</strong></div><span className="eyebrow">INTERNAL ADMINISTRATION</span><h1>Sign in to review reports</h1><p>This preview uses a single temporary administrator credential. Staff accounts and role-based permissions are planned for later phases.</p><form onSubmit={submit}><label htmlFor="password">Admin passphrase</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/><button type="submit" disabled={busy||!password}> {busy?"Verifying…":"Sign in securely"} </button></form>{error&&<p className="loginError" role="alert">{error}</p>}<Link href="/">← Return to commuter application</Link></section></main>;
}
