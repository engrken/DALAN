import ShareViewer from "./ShareViewer";
export const dynamic="force-dynamic";
export const metadata={title:"DALAN | Shared trip (restricted pilot)",robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function Page({params}){const {token}=await params;return <ShareViewer token={token}/>;}
