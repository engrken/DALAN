import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";
export const STAFF_COOKIE="dalan_staff_v2";
const ROLES=new Set(["super_admin","safety_officer","transport_admin","operator_manager","viewer"]);
export const allowedRoles=ROLES;
export const tokenHash=v=>createHash("sha256").update(v).digest("hex");
export function hashPassword(password){
 const salt=randomBytes(16).toString("hex");
 return salt+":"+scryptSync(password,Buffer.from(salt,"hex"),64).toString("hex");
}
export function validPassword(password){return typeof password==="string"&&password.length>=14&&password.length<=128}
export function verifyPassword(password,stored){
 if(typeof password!=="string"||password.length>128||typeof stored!=="string")return false;
 const [salt,hex]=stored.split(":");if(!/^[0-9a-f]{32}$/.test(salt||"")||!/^[0-9a-f]{128}$/.test(hex||""))return false;
 const candidate=scryptSync(password,Buffer.from(salt,"hex"),64),actual=Buffer.from(hex,"hex");
 return timingSafeEqual(candidate,actual);
}
export function safeCompareHex(a,b){if(!/^[0-9a-f]{64}$/.test(a||"")||!/^[0-9a-f]{64}$/.test(b||""))return false;return timingSafeEqual(Buffer.from(a,"hex"),Buffer.from(b,"hex"));}
export function safeStaffData(row){return {id:row.id,name:row.display_name,email:row.email,role:row.role};}
export async function issueStaffSession(res,staffId){
 const token=randomBytes(32).toString("hex");
 await getDb().query("INSERT INTO public.dalan_staff_sessions(token_hash,staff_id,expires_at) VALUES($1,$2,now()+interval '8 hours')",[tokenHash(token),staffId]);
 res.cookies.set(STAFF_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:28800});
}
export async function getStaff(){
 const token=(await cookies()).get(STAFF_COOKIE)?.value;
 if(!/^[0-9a-f]{64}$/.test(token||""))return null;
 const r=await getDb().query("SELECT s.id,s.display_name,s.email,s.role FROM public.dalan_staff_sessions ss JOIN public.dalan_staff s ON s.id=ss.staff_id WHERE ss.token_hash=$1 AND ss.expires_at>now() AND s.active=true",[tokenHash(token)]);
 return r.rows[0]||null;
}
export async function staffAllowed(roles){const staff=await getStaff();return staff&&(staff.role==="super_admin"||roles.includes(staff.role))?staff:null;}
export async function audit(staff,action,subject=null,description=null){
 await getDb().query("INSERT INTO public.dalan_access_audit(actor_staff_id,action,subject_id,description) VALUES($1,$2,$3,$4)",[staff.id,action,subject,description]);
}
export function strongEmail(v){return typeof v==="string"&&v.length<=180&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
