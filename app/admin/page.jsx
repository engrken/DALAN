import Link from "next/link";
import {redirect} from "next/navigation";
import {getStaff,safeStaffData} from "../../lib/staff-auth";
import {getReportSummary} from "../../lib/db";
import Control from "./ControlV3";
export const dynamic="force-dynamic";
export const metadata={title:"DALAN Control | Staff operations",robots:{index:false,follow:false}};
export default async function Page(){
 const staff=await getStaff();
 if(!staff)redirect("/admin/login");
 let data={reports:[],counts:{}},error="";
 if(["super_admin","safety_officer","transport_admin"].includes(staff.role)){
  try{data=await getReportSummary();}catch{error="Commuter report data temporarily unavailable.";}
 }
 const reports=data.reports.map(r=>({...r,created_at:new Date(r.created_at).toISOString(),reviewed_at:r.reviewed_at?new Date(r.reviewed_at).toISOString():null}));
 return <div className="adminShell"><header className="adminTop"><Link href="/" className="brandLink"><span className="brandIcon">D</span><span>DALAN <small>CONTROL</small></span></Link><span className="tag tagBlue">Staff-only · pilot</span></header><Control staff={safeStaffData(staff)} initialReports={reports} error={error}/></div>;
}
