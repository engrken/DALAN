import {NextResponse} from "next/server";
export async function POST(){return NextResponse.json({error:"Legacy shared-password administration has been disabled. Use individual DALAN staff accounts."},{status:410});}
export async function DELETE(){return NextResponse.json({ok:true});}
