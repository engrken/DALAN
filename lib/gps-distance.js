// Foreground-only movement estimation; do not retain a route history or publish a legal fare.
export function greatCircleMeters(a,b){
 const rad=Math.PI/180,dy=(b.lat-a.lat)*rad,dx=(b.lng-a.lng)*rad;
 const t=Math.sin(dy/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dx/2)**2;
 return 6371000*2*Math.asin(Math.min(1,Math.sqrt(Math.max(0,t))));
}
export function filterGpsFix(anchor,fix){
 if(!fix||!Number.isFinite(fix.lat)||!Number.isFinite(fix.lng)||Math.abs(fix.lat)>90||Math.abs(fix.lng)>180||!Number.isFinite(fix.accuracy)||fix.accuracy>45||fix.accuracy<0||!Number.isFinite(fix.timestamp)||Math.abs(Date.now()-fix.timestamp)>30000)return {accepted:false,reason:"Poor, invalid or stale GPS fix"};
 if(!anchor)return {accepted:true,meters:0,anchor:fix,reason:"Initial GPS fix"};
 const dt=(fix.timestamp-anchor.timestamp)/1000;
 if(dt<=0)return {accepted:false,reason:"Out-of-order GPS fix"};
 if(dt>45)return {accepted:true,meters:0,anchor:fix,gap:true,reason:"GPS gap; distance during gap cannot be counted"};
 if(dt<3)return {accepted:false,reason:"GPS fixes too close together"};
 const metres=greatCircleMeters(anchor,fix),speedKph=metres/dt*3.6;
 if(speedKph>95||(fix.speedMps!=null&&fix.speedMps>95/3.6))return {accepted:false,reason:"Implausible GPS jump"};
 if(metres<Math.max(12,anchor.accuracy+fix.accuracy)||speedKph<2.9)return {accepted:false,reason:"Below accuracy or movement threshold"};
 return {accepted:true,meters:metres,anchor:fix,reason:"Accepted movement"};
}
