import { NextResponse } from "next/server";
import { adminCookie, checkPassword, checkSameOrigin, makeAdminSession } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request) {
  if (!checkSameOrigin(request) || !(request.headers.get("content-type")||"").includes("application/json")) return NextResponse.json({error:"Invalid request origin"},{status:403});
  try {
    const input = await request.text();
    if (input.length > 400) return NextResponse.json({error:"Invalid credentials"},{status:400});
    const {password} = JSON.parse(input);
    if (!checkPassword(password)) return NextResponse.json({error:"Invalid credentials"},{status:401,headers:{"Cache-Control":"no-store"}});
    const response = NextResponse.json({ok:true});
    response.cookies.set(adminCookie.name,makeAdminSession(),adminCookie.options);
    return response;
  } catch { return NextResponse.json({error:"Login unavailable"},{status:503}); }
}

export async function DELETE(request) {
  if (!checkSameOrigin(request)) return NextResponse.json({error:"Invalid request origin"},{status:403});
  const response=NextResponse.json({ok:true});
  response.cookies.set(adminCookie.name,"",{...adminCookie.options,maxAge:0});
  return response;
}
