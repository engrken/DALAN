import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminSession } from "../../lib/admin-auth";
import { getReportSummary } from "../../lib/db";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "DALAN Control | Administration", robots:{index:false,follow:false} };

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect("/admin/login");
  let data, error = "";
  try { data = await getReportSummary(); }
  catch { data = {counts:{},reports:[]}; error = "DALAN database is temporarily unavailable."; }
  const safeReports=data.reports.map(r=>({...r,created_at:new Date(r.created_at).toISOString(),reviewed_at:r.reviewed_at?new Date(r.reviewed_at).toISOString():null}));
  return <div className="adminShell"><header className="adminTop"><Link href="/" className="brandLink"><span className="brandIcon">D</span><span>DALAN <small>CONTROL</small></span></Link><span className="tag tagBlue">Internal pilot dashboard</span></header><AdminDashboard initialReports={safeReports} initialCounts={data.counts} error={error}/></div>;
}
