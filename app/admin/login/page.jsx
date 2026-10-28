"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
export default function Login(){
 const [claimed,setClaimed]=useState(true),[ready,setReady]=useState(false);
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[token,setToken]=useState(""),[name,setName]=useState("");
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/staff/bootstrap",{cache:"no-store"}).then(r=>r.json()).then(j=>setClaimed(j.claimed!==false)).catch(()=>setClaimed(true)).finally(()=>setReady(true));},[]);
 async function submit(e){
  e.preventDefault();setBusy(true);setError("");
  try{
   const url=claimed?"/api/staff/session":"/api/staff/bootstrap";
   const body=claimed?{email,password}:{name,email,password,setupToken:token};
   const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const json=await res.json();if(!res.ok)throw new Error(json.error||"Unable to authenticate");
   location.assign("/admin");
  }catch(e){setError(e.message||"Unable to sign in");setBusy(false);}
 }
 return <main className="loginWrap"><section className="loginBox"><div className="loginBrand"><span className="brandIcon">D</span><strong>DALAN Control</strong></div><span className="eyebrow">INDIVIDUAL STAFF ACCOUNTS</span><h1>{!ready?"Checking account status…":claimed?"Sign in":"Initial owner enrollment"}</h1><p>{claimed?"Sign in with your personal DALAN staff account. The previous shared admin password has been disabled.":"Create DALAN's first owner account using your one-time setup token. This is available only on the protected preview."}</p><form onSubmit={submit}>{!claimed&&<><label htmlFor="displayname">Your name</label><input id="displayname" value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={90} required/><label htmlFor="setup">One-time setup token</label><input id="setup" type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} required/></>}
 <label htmlFor="email">Staff email</label><input id="email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/>
 <label htmlFor="password">Personal passphrase (minimum 14 characters)</label><input id="password" type="password" minLength={claimed?1:14} autoComplete={claimed?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} required/>
 <button disabled={busy||!ready}>{busy?"Verifying…":claimed?"Sign in":"Create owner account"}</button></form>{error&&<p className="loginError" role="alert">{error}</p>}<Link href="/">← Back to DALAN</Link></section></main>;
}
